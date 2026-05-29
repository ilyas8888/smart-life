package com.smartlife.controller;

import com.smartlife.model.User;
import com.smartlife.service.AdminSystemHealthService;
import com.smartlife.service.AiEntitlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/system")
@RequiredArgsConstructor
public class AdminSystemController {

    private final AdminSystemHealthService adminSystemHealthService;
    private final AiEntitlementService entitlementService;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getHealth(@AuthenticationPrincipal User admin) {
        entitlementService.requireAdmin(admin);
        return ResponseEntity.ok(adminSystemHealthService.getSystemHealth());
    }
}
