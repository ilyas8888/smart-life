package com.smartlife.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class KeycloakAdminService {

    private static final String KEYCLOAK_BASE_URL = "http://localhost:8180";

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Value("${keycloak.admin.username:admin}")
    private String adminUsername;

    @Value("${keycloak.admin.password:}")
    private String adminPassword;

    public void markEmailVerified(String email) {
        try {
            String token = getAdminToken();
            if (token == null) return;

            String userId = findUserIdByEmail(token, email);
            if (userId == null) return;

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(KEYCLOAK_BASE_URL + "/admin/realms/smartlife/users/" + userId))
                    .header("Authorization", "Bearer " + token)
                    .header("Content-Type", "application/json")
                    .PUT(HttpRequest.BodyPublishers.ofString("{\"emailVerified\":true}"))
                    .build();
            httpClient.send(request, HttpResponse.BodyHandlers.discarding());
        } catch (Exception ignored) {
            // Keycloak synchronization must not prevent OTP verification.
        }
    }

    private String getAdminToken() throws Exception {
        String form = "client_id=admin-cli&grant_type=password&username=" + encode(adminUsername)
                + "&password=" + encode(adminPassword);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(KEYCLOAK_BASE_URL + "/realms/master/protocol/openid-connect/token"))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(form))
                .build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() >= 400) return null;

        return objectMapper.readTree(response.body()).path("access_token").asText(null);
    }

    private String findUserIdByEmail(String token, String email) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(KEYCLOAK_BASE_URL + "/admin/realms/smartlife/users?email=" + encode(email)))
                .header("Authorization", "Bearer " + token)
                .GET()
                .build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() >= 400) return null;

        JsonNode users = objectMapper.readTree(response.body());
        if (!users.isArray() || users.isEmpty()) return null;
        return users.get(0).path("id").asText(null);
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
