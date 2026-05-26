package com.smartlife.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

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
        Map<String, Double> portions,
        String source
    ) {}

    public Optional<NutritionResult> lookup(String foodName) {
        if (usdaApiKey != null && !usdaApiKey.isBlank()) {
            return searchUSDA(foodName);
        }
        return Optional.empty();
    }

    @SuppressWarnings("unchecked")
    public List<NutritionResult> searchMultiple(String query, int limit) {
        if (usdaApiKey == null || usdaApiKey.isBlank()) return List.of();
        try {
            String queryLower = query.trim().toLowerCase(Locale.ROOT);
            int candidateLimit = 5;
            List<NutritionResult> results = new ArrayList<>();
            Set<String> resultNames = new LinkedHashSet<>();

            appendResults(results, resultNames,
                fetchUsdaFoods(query, candidateLimit, "Survey (FNDDS)"),
                queryLower, limit);
            if (results.size() < limit) {
                appendResults(results, resultNames,
                    fetchUsdaFoods(query, candidateLimit, "SR Legacy"),
                    queryLower, limit);
            }
            if (results.size() < limit) {
                appendResults(results, resultNames,
                    fetchUsdaFoods(query, candidateLimit, "Foundation"),
                    queryLower, limit);
            }

            // Brand products are useful for precise searches, but must not drown basic foods.
            if (results.size() < limit && queryLower.length() >= 4) {
                appendResults(results, resultNames,
                    fetchUsdaFoods(query, candidateLimit, "Branded"), queryLower, limit);
            }

            return results;
        } catch (Exception e) {
            log.warn("USDA searchMultiple failed for '{}': {}: {}", query,
                e.getClass().getSimpleName(), e.getMessage(), e);
            return List.of();
        }
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> fetchUsdaFoods(String query, int limit, String... dataTypes) {
        Map<String, Object> response = webClientBuilder.build()
            .get()
            .uri(uriBuilder -> uriBuilder
                .scheme("https")
                .host("api.nal.usda.gov")
                .path("/fdc/v1/foods/search")
                .queryParam("query", query)
                .queryParam("api_key", usdaApiKey)
                .queryParam("pageSize", String.valueOf(limit))
                .queryParam("dataType", (Object[]) dataTypes)
                .build())
            .retrieve()
            .bodyToMono(Map.class)
            .block();
        return response == null
            ? List.of()
            : (List<Map<String, Object>>) response.getOrDefault("foods", List.of());
    }

    private void appendResults(List<NutritionResult> results, Set<String> resultNames,
                               List<Map<String, Object>> foods, String queryLower, int limit) {
        // Try strict prefix filter first; fall back to contains if nothing matches.
        boolean anyStrict = foods.stream().anyMatch(f -> startsWithQueryOrWord(f, queryLower));
        java.util.function.Predicate<Map<String, Object>> filter = anyStrict
            ? food -> startsWithQueryOrWord(food, queryLower)
            : food -> descriptionOf(food).toLowerCase(Locale.ROOT).contains(queryLower);

        foods.stream()
            .filter(filter)
            .sorted(Comparator
                .comparingInt((Map<String, Object> food) -> suggestionRank(food, queryLower))
                .thenComparing(food -> descriptionOf(food).toLowerCase(Locale.ROOT)))
            .map(this::toNutritionResult)
            .filter(Optional::isPresent)
            .map(Optional::get)
            .filter(result -> resultNames.add(result.foodName().toLowerCase(Locale.ROOT)))
            .limit(Math.max(0, limit - results.size()))
            .forEach(results::add);
    }

    @SuppressWarnings("unchecked")
    private Optional<NutritionResult> toNutritionResult(Map<String, Object> food) {
        String name = descriptionOf(food);
        var nutrients = (List<Map<String, Object>>) food.getOrDefault("foodNutrients", List.of());
        Integer calories = null;
        BigDecimal protein = null, carbs = null, fat = null, fiber = null;
        for (var nutrient : nutrients) {
            String nutrientName = nutrientName(nutrient);
            Object value = nutrientValue(nutrient);
            if (isCalorieEnergy(nutrient, nutrientName)) {
                calories = parseInteger(value);
            } else {
                switch (nutrientName) {
                    case "Protein"                     -> protein = parseBigDecimal(value);
                    case "Carbohydrate, by difference" -> carbs   = parseBigDecimal(value);
                    case "Total lipid (fat)"           -> fat     = parseBigDecimal(value);
                    case "Fiber, total dietary"        -> fiber   = parseBigDecimal(value);
                }
            }
        }
        int kcal = calories != null ? calories : 0;
        return Optional.of(new NutritionResult(name, kcal, protein, carbs, fat, fiber, Map.of(), "usda"));
    }

    private boolean startsWithQueryOrWord(Map<String, Object> food, String queryLower) {
        String description = descriptionOf(food).toLowerCase(Locale.ROOT);
        if (description.startsWith(queryLower)) return true;
        return Arrays.stream(description.split("[^\\p{L}\\p{N}]+"))
            .anyMatch(word -> word.startsWith(queryLower));
    }

    private int suggestionRank(Map<String, Object> food, String queryLower) {
        boolean startsDescription = descriptionOf(food).toLowerCase(Locale.ROOT).startsWith(queryLower);
        return startsDescription ? 0 : 1;
    }

    private String descriptionOf(Map<String, Object> food) {
        return String.valueOf(food.getOrDefault("description", ""));
    }

    @SuppressWarnings("unchecked")
    private String nutrientName(Map<String, Object> nutrient) {
        Object directName = nutrient.get("nutrientName");
        if (directName != null) return String.valueOf(directName);
        Object name = nutrient.get("name");
        if (name != null) return String.valueOf(name);
        Object nested = nutrient.get("nutrient");
        if (nested instanceof Map<?, ?> nestedMap) {
            return String.valueOf(((Map<String, Object>) nestedMap).getOrDefault("name", ""));
        }
        return "";
    }

    @SuppressWarnings("unchecked")
    private String nutrientUnit(Map<String, Object> nutrient) {
        Object directUnit = nutrient.get("unitName");
        if (directUnit != null) return String.valueOf(directUnit);
        Object nested = nutrient.get("nutrient");
        if (nested instanceof Map<?, ?> nestedMap) {
            return String.valueOf(((Map<String, Object>) nestedMap).getOrDefault("unitName", ""));
        }
        return "";
    }

    private Object nutrientValue(Map<String, Object> nutrient) {
        return nutrient.containsKey("value") ? nutrient.get("value") : nutrient.get("amount");
    }

    private boolean isCalorieEnergy(Map<String, Object> nutrient, String nutrientName) {
        String name = nutrientName.toLowerCase(Locale.ROOT);
        String unit = nutrientUnit(nutrient).toLowerCase(Locale.ROOT);
        boolean energyName = name.equals("energy") || name.contains("metabolizable energy");
        return energyName && (unit.isBlank() || unit.equals("kcal"));
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
                    .queryParam("dataType", "Foundation", "SR Legacy", "Survey (FNDDS)")
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

            for (var nutrient : nutrients) {
                String nutrientName = nutrientName(nutrient);
                Object value = nutrientValue(nutrient);
                if (isCalorieEnergy(nutrient, nutrientName)) {
                    calories = parseInteger(value);
                } else {
                    switch (nutrientName) {
                        case "Protein"                     -> protein = parseBigDecimal(value);
                        case "Carbohydrate, by difference" -> carbs   = parseBigDecimal(value);
                        case "Total lipid (fat)"           -> fat     = parseBigDecimal(value);
                        case "Fiber, total dietary"        -> fiber   = parseBigDecimal(value);
                    }
                }
            }

            var rawPortions = new java.util.ArrayList<>((List<Map<String, Object>>) food.getOrDefault("foodPortions", List.of()));
            rawPortions.sort(java.util.Comparator.comparingInt(p -> {
                String d = String.valueOf(p.getOrDefault("portionDescription", "")).toLowerCase();
                if (d.contains("medium") || d.contains("fruit") || d.contains("whole") ||
                    (d.contains("piece") && !d.contains("pieces"))) return 0;
                if (d.contains("large")) return 2;
                if (d.contains("small")) return 3;
                return 1;
            }));
            Map<String, Double> portions = new java.util.LinkedHashMap<>();
            for (var p : rawPortions) {
                String desc = String.valueOf(p.getOrDefault("portionDescription", "")).toLowerCase();
                Object gw = p.get("gramWeight");
                if (gw == null) continue;
                double gramWeight = ((Number) gw).doubleValue();
                String canonical = null;
                if ((desc.contains("piece") && !desc.contains("pieces")) ||
                    desc.contains("medium") || desc.contains("fruit") ||
                    desc.contains("whole")  || desc.contains("large") || desc.contains("small")) {
                    canonical = "piece";
                } else if (desc.contains("cup"))                              { canonical = "cup";   }
                else if (desc.contains("bowl"))                               { canonical = "bowl";  }
                else if (desc.contains("tablespoon") || desc.contains("tbsp")){ canonical = "tbsp";  }
                else if (desc.contains("teaspoon")   || desc.contains("tsp")) { canonical = "tsp";   }
                else if (desc.contains("slice"))                              { canonical = "slice"; }
                else if (desc.contains("oz"))                                 { canonical = "oz";    }
                if (canonical != null) portions.putIfAbsent(canonical, gramWeight);
            }

            if (calories == null) return Optional.empty();

            return Optional.of(new NutritionResult(name, calories, protein, carbs, fat, fiber, portions, "usda"));
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
