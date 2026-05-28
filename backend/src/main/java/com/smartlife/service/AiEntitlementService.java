package com.smartlife.service;

import com.smartlife.exception.AiAccessDeniedException;
import com.smartlife.model.AiAccessRequest;
import com.smartlife.model.User;
import com.smartlife.model.UserAiEntitlement;
import com.smartlife.repository.AiAccessRequestRepository;
import com.smartlife.repository.UserAiEntitlementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiEntitlementService {

    private static final String FREE = "FREE";
    private static final String APPROVED = "APPROVED";
    private static final String PREMIUM = "PREMIUM";
    private static final String ADMIN = "ADMIN";
    private static final String BLOCKED = "BLOCKED";
    private static final String PENDING = "PENDING";

    private final UserAiEntitlementRepository entitlementRepository;
    private final AiAccessRequestRepository requestRepository;
    private final MailService mailService;

    @Value("${app.mail.security-alert-recipient:}")
    private String adminEmail;

    @Transactional
    public UserAiEntitlement getOrCreate(User user) {
        return entitlementRepository.findByUserId(user.getId())
                .orElseGet(() -> entitlementRepository.save(UserAiEntitlement.builder()
                        .user(user)
                        .monthlyQuota(100)
                        .resetAt(nextMonthStart())
                        .build()));
    }

    @Transactional
    public void checkAndConsume(User user) {
        var entitlement = getOrCreate(user);
        resetMonthlyIfNeeded(entitlement);

        String status = normalizeStatus(entitlement.getStatus());
        if (BLOCKED.equals(status)) {
            denyAiAccess(entitlement);
        }

        if (ADMIN.equals(status)) {
            return;
        }

        if (FREE.equals(status)) {
            int trialUsed = valueOrZero(entitlement.getTrialUsed());
            int trialQuota = entitlement.getTrialQuota() != null ? entitlement.getTrialQuota() : 5;
            if (trialUsed >= trialQuota) {
                denyAiAccess(entitlement);
            }
            entitlement.setTrialUsed(trialUsed + 1);
            entitlementRepository.save(entitlement);
            return;
        }

        int monthlyUsed = valueOrZero(entitlement.getMonthlyUsed());
        Integer monthlyQuota = entitlement.getMonthlyQuota();
        if (monthlyQuota != null && monthlyUsed >= monthlyQuota) {
            denyAiAccess(entitlement);
        }
        entitlement.setMonthlyUsed(monthlyUsed + 1);
        entitlementRepository.save(entitlement);
    }

    @Transactional
    public Map<String, Object> getStatus(User user) {
        var entitlement = getOrCreate(user);
        resetMonthlyIfNeeded(entitlement);

        String lastRequestStatus = requestRepository.findTopByUserIdOrderByRequestedAtDesc(user.getId())
                .map(AiAccessRequest::getStatus)
                .orElse("NONE");

        Map<String, Object> status = new LinkedHashMap<>();
        status.put("status", normalizeStatus(entitlement.getStatus()));
        status.put("planName", entitlement.getPlanName() != null ? entitlement.getPlanName() : "Free");
        status.put("trialUsed", valueOrZero(entitlement.getTrialUsed()));
        status.put("trialQuota", entitlement.getTrialQuota() != null ? entitlement.getTrialQuota() : 5);
        status.put("monthlyUsed", valueOrZero(entitlement.getMonthlyUsed()));
        status.put("monthlyQuota", entitlement.getMonthlyQuota() != null ? entitlement.getMonthlyQuota() : -1);
        status.put("resetAt", entitlement.getResetAt());
        status.put("expiresAt", entitlement.getExpiresAt());
        status.put("lastRequestStatus", lastRequestStatus);
        return status;
    }

    @Transactional
    public void submitRequest(User user, String message) {
        requestRepository.findTopByUserIdOrderByRequestedAtDesc(user.getId()).ifPresent(request -> {
            if (PENDING.equals(normalizeStatus(request.getStatus()))) {
                throw new IllegalArgumentException("Une demande est deja en cours.");
            }
        });

        requestRepository.save(AiAccessRequest.builder()
                .user(user)
                .message(message)
                .build());
        notifyAdminNewRequest(user, message);
    }

    public List<AiAccessRequest> getPendingRequests() {
        return requestRepository.findByStatusOrderByRequestedAtDesc(PENDING);
    }

    @Transactional
    public void approve(Long requestId, User admin, String targetStatus, Integer monthlyQuota) {
        requireAdmin(admin);

        var request = requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Demande introuvable"));
        request.setStatus("APPROVED");
        request.setReviewedBy(admin.getId());
        request.setReviewedAt(LocalDateTime.now());
        requestRepository.save(request);

        String status = normalizeTargetStatus(targetStatus);
        var entitlement = getOrCreate(request.getUser());
        entitlement.setStatus(status);
        entitlement.setPlanName(PREMIUM.equals(status) ? "Premium" : "Approved");
        entitlement.setMonthlyQuota(monthlyQuota != null ? monthlyQuota : defaultMonthlyQuota(status));
        entitlement.setMonthlyUsed(0);
        entitlement.setApprovedBy(admin.getId());
        entitlement.setApprovedAt(LocalDateTime.now());
        entitlement.setResetAt(nextMonthStart());
        entitlementRepository.save(entitlement);
        notifyUserApproved(request.getUser());
    }

    @Transactional
    public void reject(Long requestId, User admin) {
        requireAdmin(admin);

        var request = requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Demande introuvable"));
        request.setStatus("REJECTED");
        request.setReviewedBy(admin.getId());
        request.setReviewedAt(LocalDateTime.now());
        requestRepository.save(request);
        notifyUserRejected(request.getUser());
    }

    public void requireAdmin(User user) {
        var entitlement = getOrCreate(user);
        if (!ADMIN.equals(normalizeStatus(entitlement.getStatus()))) {
            throw new org.springframework.security.access.AccessDeniedException("Admin AI access required");
        }
    }

    private void resetMonthlyIfNeeded(UserAiEntitlement entitlement) {
        var resetAt = entitlement.getResetAt();
        if (resetAt != null && !LocalDateTime.now().isBefore(resetAt)) {
            entitlement.setMonthlyUsed(0);
            entitlement.setResetAt(resetAt.plusMonths(1));
            entitlementRepository.save(entitlement);
        }
    }

    private String normalizeStatus(String status) {
        return status == null || status.isBlank() ? FREE : status.trim().toUpperCase();
    }

    private String normalizeTargetStatus(String status) {
        String normalized = normalizeStatus(status);
        return switch (normalized) {
            case APPROVED, PREMIUM, ADMIN, BLOCKED -> normalized;
            default -> APPROVED;
        };
    }

    private Integer defaultMonthlyQuota(String status) {
        return switch (status) {
            case PREMIUM -> 300;
            case ADMIN -> null;
            default -> 100;
        };
    }

    private int valueOrZero(Integer value) {
        return value != null ? value : 0;
    }

    private LocalDateTime nextMonthStart() {
        return YearMonth.now().plusMonths(1).atDay(1).atStartOfDay();
    }

    private void notifyAdminNewRequest(User user, String message) {
        if (adminEmail == null || adminEmail.isBlank()) {
            return;
        }

        String body = "Utilisateur : " + user.getEmail() + "\n"
                + "Message : " + (message != null && !message.isBlank() ? message : "(aucun)") + "\n\n"
                + "Approuver ou rejeter via l'interface admin SmartLife.";
        mailService.send(adminEmail, "[SmartLife] Nouvelle demande d'acces IA", body);
    }

    private void notifyUserApproved(User user) {
        String body = "Bonjour,\n\n"
                + "Votre demande d'acces au Prompt IA SmartLife a ete approuvee.\n\n"
                + "Vous pouvez maintenant utiliser l'assistant IA depuis votre tableau de bord.\n\n"
                + "Bonne utilisation !\n"
                + "- L'equipe SmartLife";
        mailService.send(user.getEmail(), "[SmartLife] Votre acces au Prompt IA est active !", body);
    }

    private void notifyUserRejected(User user) {
        String body = "Bonjour,\n\n"
                + "Votre demande d'acces au Prompt IA n'a pas ete retenue pour le moment.\n\n"
                + "Vous pouvez soumettre une nouvelle demande depuis votre tableau de bord.\n\n"
                + "Cordialement,\n"
                + "- L'equipe SmartLife";
        mailService.send(user.getEmail(), "[SmartLife] Demande d'acces IA non retenue", body);
    }

    private void denyAiAccess(UserAiEntitlement entitlement) {
        throw new AiAccessDeniedException(
                normalizeStatus(entitlement.getStatus()),
                valueOrZero(entitlement.getTrialUsed()),
                entitlement.getTrialQuota() != null ? entitlement.getTrialQuota() : 5,
                valueOrZero(entitlement.getMonthlyUsed()),
                entitlement.getMonthlyQuota()
        );
    }
}
