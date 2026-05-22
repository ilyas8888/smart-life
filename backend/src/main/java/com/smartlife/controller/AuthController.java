package com.smartlife.controller;

import com.smartlife.dto.AuthRequest;
import com.smartlife.dto.AuthResponse;
import com.smartlife.dto.RegisterRequest;
import com.smartlife.model.User;
import com.smartlife.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Value("${spring.security.oauth2.client.provider.keycloak.issuer-uri:}")
    private String keycloakIssuerUri;

    @Value("${spring.security.oauth2.client.registration.keycloak.client-id:smartlife-backend}")
    private String keycloakClientId;

    @GetMapping("/keycloak-register")
    public void keycloakRegister(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String scheme = request.getHeader("X-Forwarded-Proto") != null ? request.getHeader("X-Forwarded-Proto") : request.getScheme();
        String host = request.getHeader("X-Forwarded-Host") != null ? request.getHeader("X-Forwarded-Host") : request.getServerName();
        String redirectUri = scheme + "://" + host + "/login/oauth2/code/keycloak";
        String url = keycloakIssuerUri + "/protocol/openid-connect/registrations"
                + "?response_type=code"
                + "&client_id=" + URLEncoder.encode(keycloakClientId, StandardCharsets.UTF_8)
                + "&scope=openid%20profile%20email"
                + "&redirect_uri=" + URLEncoder.encode(redirectUri, StandardCharsets.UTF_8);
        response.sendRedirect(url);
    }

    @PostMapping("/register")
    public ResponseEntity<Object> register(@Valid @RequestBody RegisterRequest request, HttpServletRequest http) {
        return ResponseEntity.ok(authService.register(request, http.getRemoteAddr()));
    }

    @PostMapping("/login")
    public ResponseEntity<Object> login(@Valid @RequestBody AuthRequest request, HttpServletRequest http) {
        return ResponseEntity.ok(authService.login(request, http.getRemoteAddr()));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(@RequestBody Map<String, Object> body, HttpServletRequest http) {
        Long userId = Long.valueOf(body.get("userId").toString());
        String code = (String) body.get("code");
        return ResponseEntity.ok(authService.verifyOtp(userId, code, http.getRemoteAddr()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.refresh(body.get("refreshToken")));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest http, @AuthenticationPrincipal User user) {
        String authHeader = http.getHeader("Authorization");
        String token = authHeader != null && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
        if (user != null) {
            authService.logout(token, user.getId(), http.getRemoteAddr());
        }
        return ResponseEntity.ok(Map.of("message", "Déconnecté"));
    }
}
