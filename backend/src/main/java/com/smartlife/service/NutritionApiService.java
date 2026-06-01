package com.smartlife.service;

import io.micrometer.observation.annotation.Observed;
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
        Map<String, Object> richPortions,
        String source
    ) {}

    public Optional<NutritionResult> lookup(String foodName) {
        if (usdaApiKey != null && !usdaApiKey.isBlank()) {
            return searchUSDA(foodName);
        }
        return Optional.empty();
    }

    @Observed(name = "smartlife.food.search")
    @SuppressWarnings("unchecked")
    public List<NutritionResult> searchMultiple(String query, int limit) {
        if (usdaApiKey == null || usdaApiKey.isBlank()) return List.of();
        try {
            String queryLower = query.trim().toLowerCase(Locale.ROOT);
            int candidateLimit = Math.min(limit, 8);
            List<NutritionResult> results = new ArrayList<>();
            Set<String> resultNames = new LinkedHashSet<>();

            appendResults(results, resultNames,
                fetchUsdaFoods(query, candidateLimit, "Foundation", "SR Legacy"),
                queryLower, limit);

            // Brand products are useful for precise searches, but must not drown basic foods.
            if (results.size() < limit && queryLower.length() >= 4) {
                appendResults(results, resultNames,
                    fetchUsdaFoods(query, candidateLimit, "Branded"), queryLower, limit);
            }

            return results;
        } catch (Exception e) {
            log.warn("USDA searchMultiple failed errorType={}", e.getClass().getSimpleName());
            return List.of();
        }
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> fetchUsdaFoods(String query, int limit, String... dataTypes) {
        try {
            Map<String, Object> response = webClientBuilder.build()
                .post()
                .uri(uriBuilder -> uriBuilder
                    .scheme("https")
                    .host("api.nal.usda.gov")
                    .path("/fdc/v1/foods/search")
                    .queryParam("api_key", usdaApiKey)
                    .build())
                .bodyValue(Map.of(
                    "query", query,
                    "pageSize", limit,
                    "dataType", Arrays.asList(dataTypes)
                ))
                .retrieve()
                .bodyToMono(Map.class)
                .block();
            return response == null
                ? List.of()
                : (List<Map<String, Object>>) response.getOrDefault("foods", List.of());
        } catch (Exception e) {
            log.warn("USDA source search failed types={} errorType={}",
                Arrays.toString(dataTypes), e.getClass().getSimpleName());
            return List.of();
        }
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
        if (calories == null) return Optional.empty();
        if (calories == 0 && protein == null && carbs == null && fat == null) return Optional.empty();
        return Optional.of(new NutritionResult(name, calories, protein, carbs, fat, fiber, Map.of(), Map.of(), "usda"));
    }

    private boolean startsWithQueryOrWord(Map<String, Object> food, String queryLower) {
        String description = descriptionOf(food).toLowerCase(Locale.ROOT);
        if (description.startsWith(queryLower)) return true;
        return Arrays.stream(description.split("[^\\p{L}\\p{N}]+"))
            .anyMatch(word -> word.startsWith(queryLower));
    }

    private int suggestionRank(Map<String, Object> food, String queryLower) {
        String description = descriptionOf(food).toLowerCase(Locale.ROOT);
        Object dataTypeObj = food.get("dataType");
        String dataType = dataTypeObj != null ? dataTypeObj.toString() : "";

        int brandedPenalty = "Branded".equals(dataType) ? 10 : 0;

        int lengthPenalty = description.length() > 60 ? 2 : 0;
        boolean hasJunk = description.contains("flavor") || description.contains("imitation")
                || description.contains("substitute") || description.contains("drink mix")
                || description.contains("instant");
        int junkPenalty = hasJunk ? 5 : 0;

        int baseRank;
        if (description.equals(queryLower)) baseRank = 0;
        else if (description.startsWith(queryLower + ",")) baseRank = 1;
        else if (description.startsWith(queryLower + " ")) baseRank = 2;
        else if (description.startsWith(queryLower)) baseRank = 3;
        else baseRank = 4;

        return baseRank + brandedPenalty + lengthPenalty + junkPenalty;
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
            var foods = fetchUsdaFoods(query, 1, "Survey (FNDDS)", "SR Legacy", "Foundation");
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
            Map<String, Object> richPortions = new java.util.LinkedHashMap<>();
            for (var p : rawPortions) {
                String originalDesc = String.valueOf(p.getOrDefault("portionDescription", ""));
                String desc = originalDesc.toLowerCase();
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
                if (canonical != null) {
                    portions.putIfAbsent(canonical, gramWeight);
                    richPortions.putIfAbsent(canonical, Map.of(
                        "grams", gramWeight,
                        "label", originalDesc.isBlank() ? "1 " + canonical : originalDesc,
                        "source", "usda",
                        "confidence", 0.9
                    ));
                }
            }

            if (calories == null) return Optional.empty();

            return Optional.of(new NutritionResult(name, calories, protein, carbs, fat, fiber, portions, richPortions, "usda"));
        } catch (Exception e) {
            log.warn("USDA lookup failed errorType={}", e.getClass().getSimpleName());
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
