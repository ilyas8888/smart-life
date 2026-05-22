package com.smartlife.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class NutritionApiService {

    private final WebClient.Builder webClientBuilder;

    @Value("${nutrition.usda.api-key:}")
    private String usdaApiKey;

    public record NutritionResult(
        String foodName,
        Integer calories,
        BigDecimal proteinG,
        BigDecimal carbsG,
        BigDecimal fatG,
        BigDecimal fiberG,
        String source
    ) {}

    public Optional<NutritionResult> lookup(String foodName) {
        if (usdaApiKey != null && !usdaApiKey.isBlank()) {
            return searchUSDA(foodName);
        }
        return Optional.empty();
    }

    @SuppressWarnings("unchecked")
    private Optional<NutritionResult> searchUSDA(String query) {
        try {
            Map<String, Object> response = webClientBuilder.build()
                .get()
                .uri(uriBuilder -> uriBuilder
                    .scheme("https")
                    .host("api.nal.usda.gov")
                    .path("/fdc/v1/foods/search")
                    .queryParam("query", query)
                    .queryParam("api_key", usdaApiKey)
                    .queryParam("pageSize", "1")
                    .queryParam("dataType", "Foundation,SR Legacy")
                    .build())
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            if (response == null) return Optional.empty();
            var foods = (List<Map<String, Object>>) response.getOrDefault("foods", List.of());
            if (foods.isEmpty()) return Optional.empty();

            var food = foods.get(0);
            String name = (String) food.getOrDefault("description", query);
            var nutrients = (List<Map<String, Object>>) food.getOrDefault("foodNutrients", List.of());

            Integer calories = null;
            BigDecimal protein = null, carbs = null, fat = null, fiber = null;

            for (var n : nutrients) {
                String nutrientName = (String) n.getOrDefault("nutrientName", "");
                Object value = n.get("value");
                switch (nutrientName) {
                    case "Energy"                        -> calories = parseInteger(value);
                    case "Protein"                       -> protein  = parseBigDecimal(value);
                    case "Carbohydrate, by difference"   -> carbs    = parseBigDecimal(value);
                    case "Total lipid (fat)"             -> fat      = parseBigDecimal(value);
                    case "Fiber, total dietary"          -> fiber    = parseBigDecimal(value);
                }
            }

            if (calories == null) return Optional.empty();

            return Optional.of(new NutritionResult(name, calories, protein, carbs, fat, fiber, "usda"));
        } catch (Exception e) {
            log.warn("USDA lookup failed for '{}': {}", query, e.getMessage());
            return Optional.empty();
        }
    }

    private Integer parseInteger(Object value) {
        if (value == null) return null;
        if (value instanceof Number n) return n.intValue();
        try { return Integer.parseInt(value.toString()); }
        catch (Exception e) { return null; }
    }

    private BigDecimal parseBigDecimal(Object value) {
        if (value == null) return null;
        if (value instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
        try { return new BigDecimal(value.toString()); }
        catch (Exception e) { return null; }
    }
}
