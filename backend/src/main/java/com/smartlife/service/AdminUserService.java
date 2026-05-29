package com.smartlife.service;

import com.smartlife.model.User;
import com.smartlife.model.UserAiEntitlement;
import com.smartlife.repository.UserAiEntitlementRepository;
import com.smartlife.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final UserAiEntitlementRepository entitlementRepository;
    private final AiEntitlementService entitlementService;

    public List<Map<String, Object>> getAllUsers() {
        return userRepository.findAll().stream()
                .sorted(Comparator.comparing(User::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(user -> toUserResponse(user, entitlementRepository.findByUserId(user.getId()).orElse(null)))
                .toList();
    }

    public Map<String, Object> getUserDetail(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));
        UserAiEntitlement entitlement = entitlementService.getOrCreate(user);
        return toUserResponse(user, entitlement);
    }

    private Map<String, Object> toUserResponse(User user, UserAiEntitlement entitlement) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("userId", user.getId());
        response.put("email", user.getEmail());
        response.put("firstName", user.getFirstName());
        response.put("lastName", user.getLastName());
        response.put("provider", user.getProvider());
        response.put("emailVerified", user.isEmailVerified());
        response.put("createdAt", user.getCreatedAt());
        response.put("aiStatus", entitlement != null ? entitlement.getStatus() : "FREE");
        response.put("planName", entitlement != null ? entitlement.getPlanName() : "Free");
        response.put("monthlyUsed", entitlement != null ? valueOrZero(entitlement.getMonthlyUsed()) : 0);
        response.put("monthlyQuota", entitlement != null && entitlement.getMonthlyQuota() != null
                ? entitlement.getMonthlyQuota()
                : -1);
        response.put("trialUsed", entitlement != null ? valueOrZero(entitlement.getTrialUsed()) : 0);
        response.put("trialQuota", entitlement != null && entitlement.getTrialQuota() != null
                ? entitlement.getTrialQuota()
                : 5);
        response.put("approvedAt", entitlement != null ? entitlement.getApprovedAt() : null);
        return response;
    }

    private int valueOrZero(Integer value) {
        return value != null ? value : 0;
    }
}
