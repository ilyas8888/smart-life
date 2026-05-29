package com.smartlife.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class OpenFoodFactsService {

    private final WebClient.Builder webClientBuilder;

    @SuppressWarnings("unchecked")
    public Optional<Map<String, Object>> searchServing(String foodName) {
        try {
            Map<String, Object> response = webClientBuilder.build()
                .get()
                .uri(uriBuilder -> uriBuilder
                    .scheme("https")
                    .host("world.openfoodfacts.org")
                    .path("/cgi/search.pl")
                    .queryParam("search_terms", foodName)
                    .queryParam("search_simple", 1)
                    .queryParam("action", "process")
                    .queryParam("json", 1)
                    .queryParam("page_size", 5)
                    .queryParam("fields", "product_name,serving_size,serving_quantity")
                    .build())
                .retrieve()
                .onStatus(status -> status.isError(), resp -> resp.bodyToMono(String.class).thenReturn(new RuntimeException("OFF HTTP " + resp.statusCode())))
                .bodyToMono(Map.class)
                .timeout(Duration.ofMillis(1500))
                .onErrorReturn(null)
                .block();

            if (response == null) return Optional.empty();
            Object productsObj = response.get("products");
            if (!(productsObj instanceof List<?> products)) return Optional.empty();

            List<Double> values = new ArrayList<>();
            String firstServingSize = null;
            for (Object productObj : products) {
                if (!(productObj instanceof Map<?, ?> product)) continue;
                Double grams = parseDouble(product.get("serving_quantity"));
                if (grams == null || grams <= 5 || grams >= 2000) continue;
                values.add(grams);
                if (firstServingSize == null) {
                    Object servingSize = product.get("serving_size");
                    if (servingSize != null && !String.valueOf(servingSize).isBlank()) {
                        firstServingSize = String.valueOf(servingSize);
                    }
                }
            }

            if (values.isEmpty()) return Optional.empty();
            double median = median(values);
            String label = firstServingSize == null ? "1 serving" : "1 serving " + firstServingSize;
            return Optional.of(Map.of(
                "grams", median,
                "label", label,
                "source", "openfoodfacts",
                "confidence", 0.75
            ));
        } catch (Exception e) {
            log.warn("Open Food Facts serving lookup failed for '{}': {}", foodName, e.getMessage());
            return Optional.empty();
        }
    }

    private Double parseDouble(Object value) {
        if (value == null) return null;
        if (value instanceof Number n) return n.doubleValue();
        try {
            return Double.parseDouble(String.valueOf(value).trim());
        } catch (Exception e) {
            return null;
        }
    }

    private double median(List<Double> values) {
        Collections.sort(values);
        int middle = values.size() / 2;
        if (values.size() % 2 == 1) return values.get(middle);
        return (values.get(middle - 1) + values.get(middle)) / 2.0;
    }
}
