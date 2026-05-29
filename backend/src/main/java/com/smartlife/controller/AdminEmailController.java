package com.smartlife.controller;

import com.smartlife.model.User;
import com.smartlife.service.AiEntitlementService;
import com.smartlife.service.EmailLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/emails")
@RequiredArgsConstructor
public class AdminEmailController {

    private final EmailLogService emailLogService;
    private final AiEntitlementService entitlementService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getEmailLogs(@AuthenticationPrincipal User admin) {
        entitlementService.requireAdmin(admin);
        return ResponseEntity.ok(Map.of(
                "logs", emailLogService.getRecent(),
                "counts", emailLogService.getStatusCounts()
        ));
    }
}
