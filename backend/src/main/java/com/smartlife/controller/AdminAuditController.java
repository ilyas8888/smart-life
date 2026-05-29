package com.smartlife.controller;

import com.smartlife.model.AuditLog;
import com.smartlife.model.User;
import com.smartlife.repository.AuditLogRepository;
import com.smartlife.service.AiEntitlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/audit")
@RequiredArgsConstructor
public class AdminAuditController {

    private final AuditLogRepository auditLogRepository;
    private final AiEntitlementService entitlementService;

    @GetMapping("/ai")
    public ResponseEntity<List<Map<String, Object>>> getAiAudit(@AuthenticationPrincipal User admin) {
        entitlementService.requireAdmin(admin);
        return ResponseEntity.ok(auditLogRepository.findByActionStartingWithOrderByCreatedAtDesc("AI_").stream()
                .limit(50)
                .map(this::toAuditResponse)
                .toList());
    }

    private Map<String, Object> toAuditResponse(AuditLog auditLog) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", auditLog.getId());
        response.put("action", auditLog.getAction());
        response.put("userId", auditLog.getUserId());
        response.put("detail", buildDetail(auditLog));
        response.put("createdAt", auditLog.getCreatedAt());
        return response;
    }

    private String buildDetail(AuditLog auditLog) {
        String detail = auditLog.getEntityType() != null ? auditLog.getEntityType() : "";
        if (auditLog.getEntityId() != null) {
            return detail.isBlank()
                    ? "targetId=" + auditLog.getEntityId()
                    : detail + ",targetId=" + auditLog.getEntityId();
        }
        return detail;
    }
}
