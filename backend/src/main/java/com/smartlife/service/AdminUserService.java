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

    public String exportCsv() {
        List<Map<String, Object>> users = getAllUsers();

        String header = "userId,email,firstName,lastName,provider,emailVerified,"
                + "createdAt,aiStatus,planName,monthlyUsed,monthlyQuota,"
                + "trialUsed,trialQuota,approvedAt";

        StringBuilder sb = new StringBuilder();
        sb.append(header).append("\n");

        for (Map<String, Object> user : users) {
            sb.append(csvLine(
                    user.get("userId"),
                    user.get("email"),
                    user.get("firstName"),
                    user.get("lastName"),
                    user.get("provider"),
                    user.get("emailVerified"),
                    user.get("createdAt"),
                    user.get("aiStatus"),
                    user.get("planName"),
                    user.get("monthlyUsed"),
                    user.get("monthlyQuota"),
                    user.get("trialUsed"),
                    user.get("trialQuota"),
                    user.get("approvedAt")
            )).append("\n");
        }
        return sb.toString();
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

    private String csvLine(Object... values) {
        StringBuilder line = new StringBuilder();
        for (int i = 0; i < values.length; i++) {
            if (i > 0) {
                line.append(",");
            }
            Object val = values[i];
            if (val == null) {
                line.append("");
            } else {
                String s = neutralizeCsvFormula(val.toString()).replace("\"", "\"\"");
                if (s.contains(",") || s.contains("\"") || s.contains("\n")) {
                    line.append("\"").append(s).append("\"");
                } else {
                    line.append(s);
                }
            }
        }
        return line.toString();
    }

    private String neutralizeCsvFormula(String value) {
        if (value == null || value.isBlank()) {
            return value;
        }
        char first = value.charAt(0);
        if (first == '=' || first == '+' || first == '-' || first == '@' || first == '\t' || first == '\r') {
            return "'" + value;
        }
        return value;
    }
}
