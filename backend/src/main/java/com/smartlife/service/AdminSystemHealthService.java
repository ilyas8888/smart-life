package com.smartlife.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminSystemHealthService {

    private final DataSource dataSource;

    @Value("${ai.service.url:http://localhost:8001}")
    private String aiServiceUrl;

    @Value("${brevo.api-key:}")
    private String brevoApiKey;

    @Value("${app.mail.from:${spring.mail.username:}}")
    private String fromEmail;

    public Map<String, Object> getSystemHealth() {
        Map<String, Object> health = new LinkedHashMap<>();
        health.put("backend", Map.of("status", "OK", "latencyMs", 0));
        health.put("database", checkDatabase());
        health.put("aiService", checkAiService());
        health.put("mail", checkMail());
        return health;
    }

    private Map<String, Object> checkDatabase() {
        long start = System.currentTimeMillis();
        try (
                Connection connection = dataSource.getConnection();
                Statement statement = connection.createStatement();
                ResultSet ignored = statement.executeQuery("SELECT 1")
        ) {
            return Map.of(
                    "status", "OK",
                    "latencyMs", System.currentTimeMillis() - start
            );
        } catch (Exception e) {
            return Map.of(
                    "status", "DOWN",
                    "latencyMs", -1,
                    "error", e.getMessage()
            );
        }
    }

    private Map<String, Object> checkAiService() {
        long start = System.currentTimeMillis();
        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(5))
                    .build();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(healthUrl()))
                    .timeout(Duration.ofSeconds(5))
                    .GET()
                    .build();
            HttpResponse<Void> response = client.send(request, HttpResponse.BodyHandlers.discarding());
            long latencyMs = System.currentTimeMillis() - start;
            return Map.of(
                    "status", response.statusCode() < 500 ? "OK" : "DOWN",
                    "latencyMs", latencyMs
            );
        } catch (Exception e) {
            log.warn("AI service health check failed errorType={}", e.getClass().getSimpleName());
            return Map.of(
                    "status", "DOWN",
                    "latencyMs", -1,
                    "error", "Unreachable"
            );
        }
    }

    private Map<String, Object> checkMail() {
        boolean configured = isPresent(brevoApiKey) && isPresent(fromEmail);
        return Map.of(
                "status", configured ? "OK" : "NOT_CONFIGURED",
                "configured", configured
        );
    }

    private String healthUrl() {
        String baseUrl = aiServiceUrl != null ? aiServiceUrl.trim() : "";
        if (baseUrl.endsWith("/health")) {
            return baseUrl;
        }
        return baseUrl.endsWith("/") ? baseUrl + "health" : baseUrl + "/health";
    }

    private boolean isPresent(String value) {
        return value != null && !value.isBlank();
    }
}
