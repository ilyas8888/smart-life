package com.smartlife.controller;

import com.smartlife.model.PushSubscription;
import com.smartlife.model.User;
import com.smartlife.repository.PushSubscriptionRepository;
import com.smartlife.service.PushNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/push")
@RequiredArgsConstructor
public class PushSubscriptionController {

    private final PushSubscriptionRepository pushSubscriptionRepository;
    private final PushNotificationService pushNotificationService;

    @GetMapping("/status")
    public Map<String, Object> getStatus(@AuthenticationPrincipal User user) {
        return Map.of(
                "subscribed",  pushSubscriptionRepository.existsByUserId(user.getId()),
                "configured",  pushNotificationService.isConfigured()
        );
    }

    @GetMapping("/vapid-public-key")
    public Map<String, String> getVapidPublicKey() {
        // Exposed so the frontend can use the same key from backend config
        // (alternative to env var in frontend)
        return Map.of("publicKey", System.getenv().getOrDefault("VAPID_PUBLIC_KEY", ""));
    }

    @PostMapping("/subscribe")
    public ResponseEntity<Map<String, String>> subscribe(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal User user) {

        String endpoint = (String) body.get("endpoint");
        String p256dh   = extractKey(body, "p256dh");
        String auth     = extractKey(body, "auth");

        if (endpoint == null || p256dh == null || auth == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "INVALID_SUBSCRIPTION"));
        }

        // Upsert: delete old if endpoint changed, then save
        pushSubscriptionRepository.findByUserIdAndEndpoint(user.getId(), endpoint)
                .ifPresentOrElse(
                        existing -> { /* already stored, nothing to do */ },
                        () -> {
                            PushSubscription sub = PushSubscription.builder()
                                    .user(user)
                                    .endpoint(endpoint)
                                    .p256dh(p256dh)
                                    .auth(auth)
                                    .build();
                            pushSubscriptionRepository.save(sub);
                        }
                );

        return ResponseEntity.ok(Map.of("status", "subscribed"));
    }

    @DeleteMapping("/unsubscribe")
    public ResponseEntity<Void> unsubscribe(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal User user) {

        String endpoint = (String) body.get("endpoint");
        if (endpoint != null) {
            pushSubscriptionRepository.deleteByUserIdAndEndpoint(user.getId(), endpoint);
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/test")
    public ResponseEntity<Map<String, String>> sendTest(@AuthenticationPrincipal User user) {
        if (!pushNotificationService.isConfigured()) {
            return ResponseEntity.status(503).body(Map.of("error", "VAPID_NOT_CONFIGURED"));
        }
        pushNotificationService.sendToUser(
                user.getId(),
                "SmartLife — Test",
                "Les notifications push fonctionnent correctement !",
                "/smart-life/#reminders"
        );
        return ResponseEntity.ok(Map.of("status", "sent"));
    }

    @SuppressWarnings("unchecked")
    private String extractKey(Map<String, Object> body, String key) {
        try {
            Object keys = body.get("keys");
            if (keys instanceof Map<?, ?> keysMap) {
                return (String) keysMap.get(key);
            }
        } catch (Exception ignored) {}
        return (String) body.get(key);
    }
}
