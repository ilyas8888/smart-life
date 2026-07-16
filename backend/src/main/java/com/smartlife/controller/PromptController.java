package com.smartlife.controller;

import com.smartlife.dto.DeletionConfirmRequest;
import com.smartlife.dto.PromptRequest;
import com.smartlife.dto.PromptResponse;
import com.smartlife.model.User;
import com.smartlife.service.AiEntitlementService;
import com.smartlife.service.AiService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/prompt")
@RequiredArgsConstructor
public class PromptController {

    private final AiService aiService;
    private final AiEntitlementService entitlementService;

    @PostMapping
    public ResponseEntity<PromptResponse> processPrompt(
            @Valid @RequestBody PromptRequest request,
            @AuthenticationPrincipal User user,
            HttpServletRequest http) {
        entitlementService.checkAccess(user);   // reset mensuel + validation (échec rapide, sans incrément)
        entitlementService.reserve(user);        // réservation atomique du crédit (sûr en concurrence)
        PromptResponse result;
        try {
            result = aiService.processPrompt(request.getPrompt(), user, http.getRemoteAddr());
        } catch (RuntimeException e) {
            entitlementService.refund(user);     // l'IA a échoué -> on rend le crédit
            throw e;
        }
        return ResponseEntity.ok(result);
    }

    /**
     * Confirme une suppression proposee par l'assistant (human-in-the-loop).
     * Ne consomme pas de credit IA : aucun appel au modele, juste l'action confirmee.
     * La suppression est re-derivee et scopee a l'utilisateur cote service.
     */
    @PostMapping("/confirm-deletion")
    public ResponseEntity<Map<String, Object>> confirmDeletion(
            @RequestBody DeletionConfirmRequest request,
            @AuthenticationPrincipal User user,
            HttpServletRequest http) {
        return ResponseEntity.ok(aiService.confirmDeletion(request.getDeletions(), user, http.getRemoteAddr()));
    }
}
