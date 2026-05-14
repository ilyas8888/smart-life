package com.smartlife.controller;

import com.smartlife.dto.PromptRequest;
import com.smartlife.dto.PromptResponse;
import com.smartlife.model.User;
import com.smartlife.service.AiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/prompt")
@RequiredArgsConstructor
public class PromptController {

    private final AiService aiService;

    @PostMapping
    public ResponseEntity<PromptResponse> processPrompt(
            @Valid @RequestBody PromptRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(aiService.processPrompt(request.getPrompt(), user));
    }
}
