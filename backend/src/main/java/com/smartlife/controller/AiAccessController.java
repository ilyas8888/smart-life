package com.smartlife.controller;

import com.smartlife.model.User;
import com.smartlife.service.AiEntitlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai-access")
@RequiredArgsConstructor
public class AiAccessController {

    private final AiEntitlementService entitlementService;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(entitlementService.getStatus(user));
    }

    @PostMapping("/request")
    public ResponseEntity<Map<String, String>> submitRequest(
            @AuthenticationPrincipal User user,
            @RequestBody(required = false) Map<String, String> body) {
        String message = body != null ? body.get("message") : null;
        entitlementService.submitRequest(user, message);
        return ResponseEntity.ok(Map.of("result", "Demande envoyee avec succes."));
    }
}
