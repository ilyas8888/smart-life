package com.smartlife.controller;

import com.smartlife.model.User;
import com.smartlife.service.AdminUserService;
import com.smartlife.service.AiEntitlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;
    private final AiEntitlementService entitlementService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getUsers(@AuthenticationPrincipal User admin) {
        entitlementService.requireAdmin(admin);
        return ResponseEntity.ok(adminUserService.getAllUsers());
    }

    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> getUserDetail(
            @PathVariable Long userId,
            @AuthenticationPrincipal User admin) {
        entitlementService.requireAdmin(admin);
        return ResponseEntity.ok(adminUserService.getUserDetail(userId));
    }
}
