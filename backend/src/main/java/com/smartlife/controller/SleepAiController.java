package com.smartlife.controller;

import com.smartlife.model.User;
import com.smartlife.model.UserAiEntitlement;
import com.smartlife.repository.UserAiEntitlementRepository;
import com.smartlife.service.SleepAiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/sleep/ai")
@RequiredArgsConstructor
public class SleepAiController {

    private static final Set<String> ANALYSIS_TYPES = Set.of("night", "week", "program");

    private final SleepAiService sleepAiService;
    private final UserAiEntitlementRepository entitlementRepository;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        User user = currentUser();
        UserAiEntitlement entitlement = entitlementRepository.findByUserId(user.getId()).orElse(null);
        int used = entitlement != null && entitlement.getSleepAiUsed() != null ? entitlement.getSleepAiUsed() : 0;
        int quota = entitlement != null && entitlement.getSleepAiQuota() != null ? entitlement.getSleepAiQuota() : 5;
        return ResponseEntity.ok(Map.of(
                "sleepAiUsed", used,
                "sleepAiQuota", quota,
                "remaining", Math.max(0, quota - used)
        ));
    }

    @PostMapping("/analyze")
    public ResponseEntity<?> analyze(@RequestBody Map<String, Object> body) {
        Object rawAnalysisType = body.get("analysisType");
        if (!(rawAnalysisType instanceof String analysisType) || !ANALYSIS_TYPES.contains(analysisType)) {
            return ResponseEntity.badRequest().body(Map.of("error", "INVALID_ANALYSIS_TYPE"));
        }

        try {
            return ResponseEntity.ok(sleepAiService.analyzeAndConsume(currentUser(), analysisType));
        } catch (IllegalArgumentException e) {
            if ("SLEEP_AI_QUOTA_EXCEEDED".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "SLEEP_AI_QUOTA_EXCEEDED"));
            }
            throw e;
        }
    }

    private User currentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
