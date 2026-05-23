package com.smartlife.service;

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
import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final OtpRepository otpRepository;

    @Value("${app.otp.enabled:false}")
    private boolean otpEnabled;

    @Value("${app.mail.from:${spring.mail.username:}}")
    private String fromEmail;

    @Value("${brevo.api-key:}")
    private String brevoApiKey;

    public boolean isEnabled() {
        return otpEnabled;
    }

    public void generateAndSend(User user) {
        if (!otpEnabled) return;
        String code = String.format("%06d", new Random().nextInt(1_000_000));
        otpRepository.save(OtpCode.builder()
                .userId(user.getId())
                .code(code)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .build());

        if (!brevoApiKey.isBlank() && !fromEmail.isBlank()) {
            sendViaBrevoApi(user.getEmail(), code);
        } else {
            log.info("OTP [DEV] {} → {}", user.getEmail(), code);
        }
    }

    private void sendViaBrevoApi(String toEmail, String code) {
        try {
            String json = String.format(
                "{\"sender\":{\"name\":\"SmartLife\",\"email\":\"%s\"}," +
                "\"to\":[{\"email\":\"%s\"}]," +
                "\"subject\":\"SmartLife - Code de verification\"," +
                "\"textContent\":\"Votre code SmartLife : %s\\n\\nValable 10 minutes. Ne le partagez pas.\"}",
                fromEmail, toEmail, code
            );
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("api-key", brevoApiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                log.warn("Brevo API error {}: {}", response.statusCode(), response.body());
            } else {
                log.info("OTP email sent via Brevo to {}", toEmail);
            }
        } catch (Exception e) {
            log.warn("Échec envoi email OTP via Brevo: {}", e.getMessage());
        }
    }

    public void verify(Long userId, String code) {
        OtpCode otp = otpRepository.findTopByUserIdAndUsedFalseOrderByCreatedAtDesc(userId)
                .orElseThrow(() -> new RuntimeException("Code OTP invalide"));
        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Code OTP expiré");
        }
        if (!otp.getCode().equals(code)) {
            throw new RuntimeException("Code OTP invalide");
        }
        otp.setUsed(true);
        otpRepository.save(otp);
    }
}
