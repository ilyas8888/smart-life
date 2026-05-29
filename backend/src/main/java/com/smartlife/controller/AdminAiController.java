package com.smartlife.controller;

import com.smartlife.model.AiAccessRequest;
import com.smartlife.model.AuditLog;
import com.smartlife.model.User;
import com.smartlife.model.UserAiEntitlement;
import com.smartlife.service.AiEntitlementService;
import com.smartlife.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/ai")
@RequiredArgsConstructor
public class AdminAiController {

    private final AiEntitlementService entitlementService;
    private final AuditLogService auditLogService;

    @GetMapping("/requests")
    public ResponseEntity<List<Map<String, Object>>> getRequests(
            @AuthenticationPrincipal User admin,
            @RequestParam(required = false) String status) {
        entitlementService.requireAdmin(admin);
        return ResponseEntity.ok(entitlementService.getAllRequests(status).stream()
                .map(this::toRequestResponse)
                .toList());
    }

    @GetMapping("/entitlements")
    public ResponseEntity<List<Map<String, Object>>> getEntitlements(@AuthenticationPrincipal User admin) {
        entitlementService.requireAdmin(admin);
        return ResponseEntity.ok(entitlementService.getAllEntitlements().stream()
                .map(this::toEntitlementResponse)
                .toList());
    }

    @PutMapping("/entitlements/{userId}")
    public ResponseEntity<Map<String, String>> updateEntitlement(
            @PathVariable Long userId,
            @AuthenticationPrincipal User admin,
            @RequestBody(required = false) Map<String, Object> body) {
        String status = body != null && body.get("status") instanceof String value ? value : null;
        Integer monthlyQuota = body != null && body.get("monthlyQuota") instanceof Number number
                ? number.intValue()
                : null;
        entitlementService.updateEntitlement(userId, status, monthlyQuota, admin);
        return ResponseEntity.ok(Map.of("result", "Mis à jour."));
    }

    @PutMapping("/requests/{id}/approve")
    public ResponseEntity<Map<String, String>> approve(
            @PathVariable Long id,
            @AuthenticationPrincipal User admin,
            @RequestBody(required = false) Map<String, Object> body) {
        String targetStatus = body != null ? (String) body.get("status") : "APPROVED";
        Integer monthlyQuota = body != null && body.get("monthlyQuota") instanceof Number number
                ? number.intValue()
                : null;
        entitlementService.approve(id, admin, targetStatus, monthlyQuota);
        return ResponseEntity.ok(Map.of("result", "Acces accorde."));
    }

    @PutMapping("/requests/{id}/reject")
    public ResponseEntity<Map<String, String>> reject(
            @PathVariable Long id,
            @AuthenticationPrincipal User admin) {
        entitlementService.reject(id, admin);
        return ResponseEntity.ok(Map.of("result", "Demande rejetee."));
    }

    @GetMapping("/audit-log")
    public ResponseEntity<List<Map<String, Object>>> getAuditLog(@AuthenticationPrincipal User admin) {
        entitlementService.requireAdmin(admin);
        return ResponseEntity.ok(auditLogService.getRecentAiLogs().stream()
                .map(this::toAuditResponse)
                .toList());
    }

    private Map<String, Object> toAuditResponse(AuditLog log) {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("id", log.getId());
        r.put("action", log.getAction());
        r.put("adminId", log.getUserId());
        r.put("entityType", log.getEntityType());
        r.put("entityId", log.getEntityId());
        r.put("createdAt", log.getCreatedAt());
        return r;
    }

    private Map<String, Object> toRequestResponse(AiAccessRequest request) {
        User user = request.getUser();
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", request.getId());
        response.put("userId", user != null ? user.getId() : null);
        response.put("email", user != null ? user.getEmail() : "");
        response.put("message", request.getMessage() != null ? request.getMessage() : "");
        response.put("status", request.getStatus());
        response.put("requestedAt", request.getRequestedAt());
        response.put("reviewedAt", request.getReviewedAt());
        return response;
    }

    private Map<String, Object> toEntitlementResponse(UserAiEntitlement entitlement) {
        User user = entitlement.getUser();
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("userId", user != null ? user.getId() : null);
        response.put("email", user != null ? user.getEmail() : "");
        response.put("status", entitlement.getStatus());
        response.put("planName", entitlement.getPlanName());
        response.put("trialUsed", entitlement.getTrialUsed());
        response.put("trialQuota", entitlement.getTrialQuota());
        response.put("monthlyUsed", entitlement.getMonthlyUsed());
        response.put("monthlyQuota", entitlement.getMonthlyQuota());
        response.put("approvedAt", entitlement.getApprovedAt());
        response.put("resetAt", entitlement.getResetAt());
        return response;
    }
}
