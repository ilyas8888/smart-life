package com.smartlife.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {

    private final ObjectMapper objectMapper;

    @Value("${brevo.api-key:}")
    private String brevoApiKey;

    @Value("${app.mail.from:${spring.mail.username:}}")
    private String fromEmail;

    public void send(String toEmail, String subject, String textContent) {
        if (isBlank(toEmail)) {
            log.info("[MAIL SKIPPED] Missing recipient for subject: {}", subject);
            return;
        }
        if (isBlank(brevoApiKey) || isBlank(fromEmail)) {
            log.info("[MAIL DEV] To: {} | Subject: {} | Body: {}", toEmail, subject, textContent);
            return;
        }

        try {
            String json = objectMapper.writeValueAsString(Map.of(
                    "sender", Map.of("name", "SmartLife", "email", fromEmail),
                    "to", List.of(Map.of("email", toEmail)),
                    "subject", subject,
                    "textContent", textContent
            ));
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("api-key", brevoApiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();
            HttpResponse<String> response = HttpClient.newHttpClient()
                    .send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 400) {
                log.warn("Brevo API error {}: {}", response.statusCode(), response.body());
            } else {
                log.info("Email sent via Brevo to {}", toEmail);
            }
        } catch (Exception e) {
            log.warn("Failed to send email via Brevo: {}", e.getMessage());
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
