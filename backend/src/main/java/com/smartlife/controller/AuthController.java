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
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Value("${KC_HOSTNAME:ilyas8888-smartlife-backend.hf.space}")
    private String kcHostname;

    @Value("${KEYCLOAK_CLIENT_ID:smartlife-backend}")
    private String keycloakClientId;

    @Value("${app.public-backend-url:https://ilyas8888-smartlife-backend.hf.space}")
    private String publicBackendUrl;

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    @GetMapping("/keycloak-register")
    public void keycloakRegister(HttpServletResponse response) throws IOException {
        String redirectUri = publicBackendUrl.replaceAll("/+$", "") + "/login/oauth2/code/keycloak";
        String issuerBase = kcHostname.startsWith("localhost") ? "http://" + kcHostname : "https://" + kcHostname;
        String url = issuerBase + "/realms/smartlife/protocol/openid-connect/registrations"
                + "?response_type=code"
                + "&client_id=" + URLEncoder.encode(keycloakClientId, StandardCharsets.UTF_8)
                + "&scope=openid%20profile%20email"
                + "&redirect_uri=" + URLEncoder.encode(redirectUri, StandardCharsets.UTF_8);
        response.sendRedirect(url);
    }

    @PostMapping("/register")
    public ResponseEntity<Object> register(@Valid @RequestBody RegisterRequest request,
                                           HttpServletRequest http, HttpServletResponse response) {
        Object result = authService.register(request, http.getRemoteAddr());
        if (result instanceof AuthResponse auth) {
            setRefreshCookie(response, auth.getRefreshToken());
            return ResponseEntity.ok(toPublicAuth(auth));
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/login")
    public ResponseEntity<Object> login(@Valid @RequestBody AuthRequest request,
                                        HttpServletRequest http, HttpServletResponse response) {
        Object result = authService.login(request, http.getRemoteAddr());
        if (result instanceof AuthResponse auth) {
            setRefreshCookie(response, auth.getRefreshToken());
            return ResponseEntity.ok(toPublicAuth(auth));
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Object> verifyOtp(@RequestBody Map<String, Object> body,
                                             HttpServletRequest http, HttpServletResponse response) {
        Long userId = Long.valueOf(body.get("userId").toString());
        String code = (String) body.get("code");
        AuthResponse auth = authService.verifyOtp(userId, code, http.getRemoteAddr());
        setRefreshCookie(response, auth.getRefreshToken());
        return ResponseEntity.ok(toPublicAuth(auth));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(
            @CookieValue(name = "refreshToken", required = false) String refreshToken,
            HttpServletResponse response) {
        Map<String, String> result = authService.refresh(refreshToken);
        setRefreshCookie(response, result.get("refreshToken"));
        return ResponseEntity.ok(Map.of("accessToken", result.get("accessToken")));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest http, HttpServletResponse response,
                                    @AuthenticationPrincipal User user) {
        String authHeader = http.getHeader("Authorization");
        String token = authHeader != null && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
        if (user != null) {
            authService.logout(token, user.getId(), http.getRemoteAddr());
        }
        clearRefreshCookie(response);
        return ResponseEntity.ok(Map.of("message", "Déconnecté"));
    }

    private void setRefreshCookie(HttpServletResponse response, String value) {
        response.addHeader(HttpHeaders.SET_COOKIE, ResponseCookie.from("refreshToken", value)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/api/auth/refresh")
                .maxAge(Duration.ofDays(7))
                .sameSite(cookieSecure ? "None" : "Lax")
                .build()
                .toString());
    }

    private void clearRefreshCookie(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/api/auth/refresh")
                .maxAge(Duration.ZERO)
                .sameSite(cookieSecure ? "None" : "Lax")
                .build()
                .toString());
    }

    private Map<String, Object> toPublicAuth(AuthResponse auth) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("token", auth.getToken());
        map.put("email", auth.getEmail());
        map.put("firstName", auth.getFirstName());
        map.put("lastName", auth.getLastName());
        return map;
    }
}
