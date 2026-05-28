package com.smartlife.controller;

import com.smartlife.model.AiAccessRequest;
import com.smartlife.model.User;
import com.smartlife.service.AiEntitlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/ai")
@RequiredArgsConstructor
public class AdminAiController {

    private final AiEntitlementService entitlementService;

    @GetMapping("/requests")
    public ResponseEntity<List<Map<String, Object>>> getPendingRequests(@AuthenticationPrincipal User admin) {
        entitlementService.requireAdmin(admin);
        return ResponseEntity.ok(entitlementService.getPendingRequests().stream()
                .map(this::toRequestResponse)
                .toList());
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

    private Map<String, Object> toRequestResponse(AiAccessRequest request) {
        User user = request.getUser();
        return Map.of(
                "id", request.getId(),
                "userId", user != null ? user.getId() : null,
                "email", user != null ? user.getEmail() : "",
                "message", request.getMessage() != null ? request.getMessage() : "",
                "status", request.getStatus(),
                "requestedAt", request.getRequestedAt()
        );
    }
}
