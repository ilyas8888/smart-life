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
    private final EmailLogService emailLogService;

    @Value("${brevo.api-key:}")
    private String brevoApiKey;

    @Value("${app.mail.from:${spring.mail.username:}}")
    private String fromEmail;

    public void send(String toEmail, String subject, String textContent) {
        if (isBlank(toEmail)) {
            log.info("Email delivery skipped: missing recipient");
            emailLogService.log(toEmail, subject, "SKIPPED", "Missing recipient");
            return;
        }
        if (isBlank(brevoApiKey) || isBlank(fromEmail)) {
            log.info("Email delivery skipped in development mode");
            emailLogService.log(toEmail, subject, "SKIPPED", "Dev mode");
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
                log.warn("Brevo email API error status={}", response.statusCode());
                emailLogService.log(toEmail, subject, "FAILED", "Brevo error " + response.statusCode());
            } else {
                log.info("Email sent via Brevo");
                emailLogService.log(toEmail, subject, "SENT", null);
            }
        } catch (Exception e) {
            log.warn("Email delivery failed errorType={}", e.getClass().getSimpleName());
            emailLogService.log(toEmail, subject, "FAILED", e.getClass().getSimpleName());
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
