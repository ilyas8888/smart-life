package com.smartlife.service;

import com.smartlife.model.FoodCache;
import com.smartlife.model.FoodLog;
import com.smartlife.model.User;
import com.smartlife.repository.FoodLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class LocalFoodParserService {

    private static final Pattern SPLIT_PATTERN = Pattern.compile("\\s+(?:et|and)\\s+|[,;+]", Pattern.CASE_INSENSITIVE);
    private static final Pattern QUANTITY_UNIT_NAME = Pattern.compile(
            "(\\d+(?:[.,]\\d+)?)\\s*(g|gr|grammes?|kg|oz|ml|tbsp|tsp|cup|bol|bowl|piece|pieces?|tranches?|slice|slices?)\\s+(?:de\\s+|d['']\\s*)?(.+)",
            Pattern.CASE_INSENSITIVE);
    private static final Pattern NAME_QUANTITY_UNIT = Pattern.compile(
            "(.+?)\\s+(\\d+(?:[.,]\\d+)?)\\s*(g|gr|grammes?|kg|oz|ml|tbsp|tsp|cup)",
            Pattern.CASE_INSENSITIVE);
    private static final Pattern QUANTITY_NAME = Pattern.compile("(\\d+)\\s+(.{3,})", Pattern.CASE_INSENSITIVE);

    private final FoodCacheService foodCacheService;
    private final NutritionApiService nutritionApiService;
    private final FoodLogRepository foodLogRepository;

    record ParsedItem(String name, double quantity, String unit) {}

    public List<FoodLog> parse(String prompt, String mealType, User user) {
        if (prompt == null || prompt.isBlank()) {
            return List.of();
        }

        List<FoodLog> logs = new ArrayList<>();
        for (ParsedItem item : parseItems(prompt)) {
            foodCacheService.findByName(item.name()).ifPresentOrElse(cache -> {
                double scale = computeLocalScale(item.quantity(), item.unit(), cache);
                FoodLog log = buildLog(
                        user,
                        mealType,
                        cache.getFoodName(),
                        quantityLabel(item),
                        scaleInt(cache.getCalories(), scale),
                        scaleBD(cache.getProteinG(), scale),
                        scaleBD(cache.getCarbsG(), scale),
                        scaleBD(cache.getFatG(), scale),
                        scaleBD(cache.getFiberG(), scale)
                );
                foodLogRepository.save(log);
                foodCacheService.upsert(log);
                logs.add(log);
            }, () -> nutritionApiService.lookup(item.name()).ifPresentOrElse(apiResult -> {
                double scale = computeLocalScale(item.quantity(), item.unit(), apiResult.portions());
                FoodLog log = buildLog(
                        user,
                        mealType,
                        apiResult.foodName(),
                        quantityLabel(item),
                        scaleInt(apiResult.calories(), scale),
                        scaleBD(apiResult.proteinG(), scale),
                        scaleBD(apiResult.carbsG(), scale),
                        scaleBD(apiResult.fatG(), scale),
                        scaleBD(apiResult.fiberG(), scale)
                );
                foodLogRepository.save(log);
                foodCacheService.upsert(log, "usda", apiResult.portions(), apiResult.richPortions());
                logs.add(log);
            }, () -> {
                FoodLog log = buildLog(user, mealType, item.name(), quantityLabel(item), null, null, null, null, null);
                foodLogRepository.save(log);
                logs.add(log);
            }));
        }
        return logs;
    }

    private List<ParsedItem> parseItems(String prompt) {
        List<ParsedItem> items = new ArrayList<>();
        for (String rawSegment : SPLIT_PATTERN.split(prompt)) {
            String segment = rawSegment.trim();
            if (segment.length() < 2) {
                continue;
            }
            items.add(parseItem(segment));
        }
        return items;
    }

    private ParsedItem parseItem(String segment) {
        var quantityUnitName = QUANTITY_UNIT_NAME.matcher(segment);
        if (quantityUnitName.matches()) {
            return new ParsedItem(
                    quantityUnitName.group(3).trim(),
                    parseQuantity(quantityUnitName.group(1)),
                    normalizeUnit(quantityUnitName.group(2))
            );
        }

        var nameQuantityUnit = NAME_QUANTITY_UNIT.matcher(segment);
        if (nameQuantityUnit.matches()) {
            return new ParsedItem(
                    nameQuantityUnit.group(1).trim(),
                    parseQuantity(nameQuantityUnit.group(2)),
                    normalizeUnit(nameQuantityUnit.group(3))
            );
        }

        var quantityName = QUANTITY_NAME.matcher(segment);
        if (quantityName.matches()) {
            return new ParsedItem(quantityName.group(2).trim(), parseQuantity(quantityName.group(1)), "piece");
        }

        return new ParsedItem(segment.trim(), 100.0, "g");
    }

    private double parseQuantity(String value) {
        try {
            return Double.parseDouble(value.replace(',', '.'));
        } catch (Exception e) {
            return 100.0;
        }
    }

    private String normalizeUnit(String unit) {
        String normalized = unit == null ? "g" : unit.toLowerCase();
        return switch (normalized) {
            case "gr", "gramme", "grammes" -> "g";
            case "bol" -> "bowl";
            case "tranche", "tranches", "slice", "slices" -> "slice";
            case "pieces" -> "piece";
            default -> normalized;
        };
    }

    private double computeLocalScale(double quantity, String unit, FoodCache cache) {
        Map<String, Double> portions = extractPortions(cache.getNutritionDetails());
        return computeLocalScale(quantity, unit, portions);
    }

    private double computeLocalScale(double quantity, String unit, Map<String, Double> portions) {
        return switch (unit == null ? "" : unit) {
            case "g", "gr", "ml" -> quantity / 100.0;
            case "kg" -> quantity * 10.0;
            case "oz" -> quantity * 28.35 / 100.0;
            case "piece", "bowl", "cup", "slice" -> {
                Double gramWeight = portions == null ? null : portions.get(unit);
                yield gramWeight != null ? (quantity * gramWeight) / 100.0 : 1.0;
            }
            default -> 1.0;
        };
    }

    private Map<String, Double> extractPortions(Map<String, Object> nutritionDetails) {
        if (nutritionDetails == null) return Map.of();
        Object rawPortions = nutritionDetails.get("portions");
        if (!(rawPortions instanceof Map<?, ?> rawMap)) return Map.of();

        Map<String, Double> portions = new HashMap<>();
        for (var entry : rawMap.entrySet()) {
            String key = String.valueOf(entry.getKey());
            Object val = entry.getValue();
            if (val instanceof Number n) {
                portions.put(key, n.doubleValue());
            } else if (val instanceof Map<?, ?> richVal) {
                Object grams = richVal.get("grams");
                if (grams instanceof Number g) portions.put(key, g.doubleValue());
            }
        }
        return portions;
    }

    private FoodLog buildLog(User user, String mealType, String name, String quantityLabel,
                             Integer calories, BigDecimal protein, BigDecimal carbs,
                             BigDecimal fat, BigDecimal fiber) {
        return FoodLog.builder()
                .user(user)
                .logDate(LocalDate.now())
                .mealType(mealType)
                .foodItem(name)
                .quantity(quantityLabel)
                .calories(calories)
                .proteinG(protein)
                .carbsG(carbs)
                .fatG(fat)
                .fiberG(fiber)
                .build();
    }

    private String quantityLabel(ParsedItem item) {
        return trimQuantity(item.quantity()) + " " + item.unit();
    }

    private String trimQuantity(double quantity) {
        return quantity == Math.rint(quantity) ? String.valueOf((long) quantity) : String.valueOf(quantity);
    }

    private Integer scaleInt(Number per100g, double scale) {
        if (per100g == null) return null;
        return (int) Math.round(per100g.doubleValue() * scale);
    }

    private BigDecimal scaleBD(BigDecimal per100g, double scale) {
        if (per100g == null) return null;
        return per100g.multiply(BigDecimal.valueOf(scale)).setScale(2, RoundingMode.HALF_UP);
    }
}
