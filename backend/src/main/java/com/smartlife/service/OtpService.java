package com.smartlife.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartlife.model.OtpCode;
import com.smartlife.model.User;
import com.smartlife.repository.OtpRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private static final int MAX_ATTEMPTS = 5;

    private final OtpRepository otpRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.otp.enabled:false}")
    private boolean otpEnabled;

    @Value("${app.mail.from:${spring.mail.username:}}")
    private String fromEmail;

    @Value("${brevo.api-key:}")
    private String brevoApiKey;

    @Value("${app.mail.security-alert-recipient:}")
    private String securityAlertRecipient;

    public boolean isEnabled() {
        return otpEnabled;
    }

    public void generateAndSend(User user) {
        if (!otpEnabled) return;
        String code = String.format("%06d", new SecureRandom().nextInt(1_000_000));
        otpRepository.save(OtpCode.builder()
                .userId(user.getId())
                .codeHash(sha256(code))
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .build());

        if (!brevoApiKey.isBlank() && !fromEmail.isBlank()) {
            sendViaBrevoApi(user.getEmail(), code);
        } else {
            log.info("OTP generated in development mode; email delivery skipped");
        }
    }

    public void verify(Long userId, String code) {
        OtpCode otp = otpRepository.findTopByUserIdAndUsedFalseOrderByCreatedAtDesc(userId)
                .orElseThrow(() -> new RuntimeException("Code OTP invalide"));
        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Code OTP expiré");
        }
        if (otp.getAttempts() >= MAX_ATTEMPTS) {
            throw new RuntimeException("Code OTP invalide");
        }
        if (!MessageDigest.isEqual(
                sha256(code).getBytes(StandardCharsets.UTF_8),
                otp.getCodeHash().getBytes(StandardCharsets.UTF_8))) {
            otp.setAttempts(otp.getAttempts() + 1);
            otpRepository.save(otp);
            throw new RuntimeException("Code OTP invalide");
        }
        otp.setUsed(true);
        otpRepository.save(otp);
    }

    public void sendOAuth2LoginNotification(User user, String ip) {
        if (brevoApiKey.isBlank() || fromEmail.isBlank() || securityAlertRecipient.isBlank()) return;
        try {
            String content = "Connexion OAuth2 validee.\n\nEmail utilisateur : " + user.getEmail()
                    + "\nDate/heure (UTC) : " + Instant.now()
                    + "\nAdresse IP : " + ip;
            String json = mailPayload(securityAlertRecipient, "[SmartLife] Connexion detectee", content);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("api-key", brevoApiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();
            HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                log.warn("Brevo security alert API error status={}", response.statusCode());
            }
        } catch (Exception e) {
            log.warn("OAuth2 security alert delivery failed errorType={}", e.getClass().getSimpleName());
        }
    }

    private void sendViaBrevoApi(String toEmail, String code) {
        try {
            String json = mailPayload(toEmail, "SmartLife - Code de verification",
                    "Votre code SmartLife : " + code + "\n\nValable 10 minutes. Ne le partagez pas.");
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("api-key", brevoApiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                log.warn("Brevo OTP API error status={}", response.statusCode());
            } else {
                log.info("OTP email sent via Brevo");
            }
        } catch (Exception e) {
            log.warn("OTP email delivery failed errorType={}", e.getClass().getSimpleName());
        }
    }

    private String mailPayload(String toEmail, String subject, String textContent) throws JsonProcessingException {
        return objectMapper.writeValueAsString(Map.of(
                "sender", Map.of("name", "SmartLife", "email", fromEmail),
                "to", List.of(Map.of("email", toEmail)),
                "subject", subject,
                "textContent", textContent
        ));
    }

    private String sha256(String value) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new IllegalStateException("OTP hashing failed", e);
        }
    }
}
