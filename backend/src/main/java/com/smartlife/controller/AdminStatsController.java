package com.smartlife.controller;

import com.smartlife.model.User;
import com.smartlife.service.AdminStatsService;
import com.smartlife.service.AiEntitlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/stats")
@RequiredArgsConstructor
public class AdminStatsController {

    private final AdminStatsService adminStatsService;
    private final AiEntitlementService entitlementService;

    @GetMapping("/prompts")
    public ResponseEntity<Map<String, Object>> getPromptStats(@AuthenticationPrincipal User admin) {
        entitlementService.requireAdmin(admin);
        return ResponseEntity.ok(adminStatsService.getPromptStats());
    }
}
