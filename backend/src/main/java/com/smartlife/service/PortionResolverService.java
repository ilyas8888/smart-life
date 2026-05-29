package com.smartlife.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PortionResolverService {

    private final OpenFoodFactsService openFoodFactsService;

    public Map<String, Object> resolve(Map<String, Object> nutritionDetails, String foodName) {
        if (nutritionDetails == null) return Map.of();
        Object rawPortions = nutritionDetails.get("portions");
        String foodNameLower = foodName == null ? "" : foodName.toLowerCase();
        Map<String, Object> portions = new LinkedHashMap<>();

        if (rawPortions instanceof Map<?, ?> rawMap && !rawMap.isEmpty()) {
            for (var entry : rawMap.entrySet()) {
                String unit = String.valueOf(entry.getKey());
                Object value = entry.getValue();
                Map<String, Object> portion = toRichPortion(unit, value);
                if (portion == null) continue;

                double grams = numberValue(portion.get("grams"), 0.0);
                if (isAbsurd(unit, grams, foodNameLower)) {
                    portion = new LinkedHashMap<>(portion);
                    portion.put("confidence", 0.15);
                }
                portions.put(unit, portion);
            }
        }
        boolean allLowConfidence = portions.values().stream()
            .allMatch(portion -> portion instanceof Map<?, ?> portionMap
                && numberValue(portionMap.get("confidence"), 0.0) < 0.5);

        if (allLowConfidence) {
            openFoodFactsService.searchServing(foodName).ifPresent(serving -> {
                portions.put("serving", serving);
                log.info("OFF enrichment for {}: {}g", foodName, serving.get("grams"));
            });
        }

        return portions;
    }

    private Map<String, Object> toRichPortion(String unit, Object value) {
        if (value instanceof Number n) {
            return new LinkedHashMap<>(Map.of(
                "grams", n.doubleValue(),
                "label", "1 " + unit,
                "source", "legacy",
                "confidence", 1.0
            ));
        }
        if (!(value instanceof Map<?, ?> valueMap)) return null;
        Object grams = valueMap.get("grams");
        if (!(grams instanceof Number)) return null;

        Map<String, Object> portion = new LinkedHashMap<>();
        portion.put("grams", grams);
        Object label = valueMap.get("label");
        Object source = valueMap.get("source");
        Object confidence = valueMap.get("confidence");
        portion.put("label", label != null ? label : "1 " + unit);
        portion.put("source", source != null ? source : "unknown");
        portion.put("confidence", confidence != null ? confidence : 0.2);
        return portion;
    }

    private boolean isAbsurd(String unit, double grams, String foodNameLower) {
        if ("tbsp".equals(unit)) return grams < 3 || grams > 60;
        if ("tsp".equals(unit)) return grams < 1 || grams > 20;
        if (isPieceLike(unit)) {
            if (foodNameLower.contains("grape") || foodNameLower.contains("raisin")) return grams > 15;
            if (foodNameLower.contains("egg")) return grams < 20 || grams > 90;
            if (foodNameLower.contains("bread") || foodNameLower.contains("slice")) return grams < 10 || grams > 100;
            if (foodNameLower.contains("almond") || foodNameLower.contains("walnut")) return grams > 15;
        }
        return false;
    }

    private boolean isPieceLike(String unit) {
        return "piece".equals(unit)
            || "egg".equals(unit)
            || "large".equals(unit)
            || "medium".equals(unit)
            || "small".equals(unit);
    }

    private double numberValue(Object value, double fallback) {
        if (value instanceof Number n) return n.doubleValue();
        try {
            return value == null ? fallback : Double.parseDouble(String.valueOf(value));
        } catch (Exception e) {
            return fallback;
        }
    }
}
