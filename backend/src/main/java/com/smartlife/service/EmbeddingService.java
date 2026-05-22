package com.smartlife.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmbeddingService {

    private final WebClient.Builder webClientBuilder;

    @Value("${voyage.api-key:}")
    private String voyageApiKey;

    @SuppressWarnings("unchecked")
    public Optional<String> embed(String text) {
        if (voyageApiKey == null || voyageApiKey.isBlank()) return Optional.empty();
        try {
            Map<String, Object> body = Map.of(
                "input", List.of(text),
                "model", "voyage-3-lite"
            );
            Map<String, Object> response = webClientBuilder.build()
                .post()
                .uri("https://api.voyageai.com/v1/embeddings")
                .header("Authorization", "Bearer " + voyageApiKey)
                .header("Content-Type", "application/json")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            if (response == null) return Optional.empty();
            var data = (List<Map<String, Object>>) response.get("data");
            if (data == null || data.isEmpty()) return Optional.empty();
            var embedding = (List<Number>) data.get(0).get("embedding");
            if (embedding == null) return Optional.empty();

            String vec = "[" + embedding.stream()
                .map(n -> String.valueOf(n.floatValue()))
                .collect(Collectors.joining(",")) + "]";
            return Optional.of(vec);
        } catch (Exception e) {
            log.warn("Embedding failed for '{}': {}", text, e.getMessage());
            return Optional.empty();
        }
    }
}
