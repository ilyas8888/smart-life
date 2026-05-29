package com.smartlife.controller;

import com.smartlife.model.User;
import com.smartlife.service.AdminOverviewService;
import com.smartlife.service.AiEntitlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/overview")
@RequiredArgsConstructor
public class AdminOverviewController {

    private final AdminOverviewService adminOverviewService;
    private final AiEntitlementService entitlementService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getOverview(@AuthenticationPrincipal User admin) {
        entitlementService.requireAdmin(admin);
        return ResponseEntity.ok(adminOverviewService.getOverview(admin));
    }
}
