package com.smartlife.controller;

import com.smartlife.dto.NutritionSummaryDto;
import com.smartlife.model.FoodCache;
import com.smartlife.model.FoodLog;
import com.smartlife.model.User;
import com.smartlife.repository.FoodCacheRepository;
import com.smartlife.repository.FoodLogRepository;
import com.smartlife.service.AiService;
import com.smartlife.service.NutritionApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/food-logs")
@RequiredArgsConstructor
public class FoodLogController {

    private final FoodLogRepository foodLogRepository;
    private final FoodCacheRepository foodCacheRepository;
    private final AiService aiService;
    private final NutritionApiService nutritionApiService;

    @GetMapping
    public List<FoodLog> getFoodLogs(@AuthenticationPrincipal User user) {
        return foodLogRepository.findByUserIdOrderByLogDateDescLoggedAtDesc(user.getId());
    }

    @PostMapping
    public ResponseEntity<FoodLog> createFoodLog(@RequestBody Map<String, Object> body,
                                                 @AuthenticationPrincipal User user) {
        FoodLog log = FoodLog.builder()
                .user(user)
                .foodItem((String) body.get("foodItem"))
                .mealType((String) body.getOrDefault("mealType", "SNACK"))
                .quantity((String) body.get("quantity"))
                .calories(body.get("calories") != null ? ((Number) body.get("calories")).intValue() : null)
                .proteinG(body.get("proteinG") != null ? BigDecimal.valueOf(((Number) body.get("proteinG")).doubleValue()) : null)
                .carbsG(body.get("carbsG") != null ? BigDecimal.valueOf(((Number) body.get("carbsG")).doubleValue()) : null)
                .fatG(body.get("fatG") != null ? BigDecimal.valueOf(((Number) body.get("fatG")).doubleValue()) : null)
                .logDate(LocalDate.now())
                .build();
        return ResponseEntity.ok(foodLogRepository.save(log));
    }

    @GetMapping("/today")
    public List<FoodLog> getTodayFoodLogs(@AuthenticationPrincipal User user) {
        return foodLogRepository.findByUserIdAndLogDate(user.getId(), LocalDate.now());
    }

    @GetMapping("/summary/today")
    public NutritionSummaryDto getTodaySummary(@AuthenticationPrincipal User user) {
        var logs = foodLogRepository.findByUserIdAndLogDate(user.getId(), LocalDate.now());
        var summary = new NutritionSummaryDto();
        summary.setTotalCalories(logs.stream().map(l -> l.getCalories() != null ? BigDecimal.valueOf(l.getCalories()) : BigDecimal.ZERO).reduce(BigDecimal.ZERO, BigDecimal::add));
        summary.setTotalProteinG(logs.stream().map(l -> l.getProteinG() != null ? l.getProteinG() : BigDecimal.ZERO).reduce(BigDecimal.ZERO, BigDecimal::add));
        summary.setTotalCarbsG(logs.stream().map(l -> l.getCarbsG() != null ? l.getCarbsG() : BigDecimal.ZERO).reduce(BigDecimal.ZERO, BigDecimal::add));
        summary.setTotalFatG(logs.stream().map(l -> l.getFatG() != null ? l.getFatG() : BigDecimal.ZERO).reduce(BigDecimal.ZERO, BigDecimal::add));
        summary.setTotalFiberG(logs.stream().map(l -> l.getFiberG() != null ? l.getFiberG() : BigDecimal.ZERO).reduce(BigDecimal.ZERO, BigDecimal::add));
        summary.setMealCount(logs.size());
        summary.setMeals(logs.stream().map(l -> Map.<String,Object>of("foodItem", l.getFoodItem(), "mealType",
                l.getMealType() != null ? l.getMealType() : "", "calories", l.getCalories() != null ? l.getCalories() : 0,
                "proteinG", l.getProteinG() != null ? l.getProteinG() : 0, "carbsG", l.getCarbsG() != null ? l.getCarbsG() : 0,
                "fatG", l.getFatG() != null ? l.getFatG() : 0)).toList());
        return summary;
    }

    @SuppressWarnings("unchecked")
    @PostMapping("/quick-add")
    public ResponseEntity<List<FoodLog>> quickAddFoods(@RequestBody Map<String, Object> body,
                                                        @AuthenticationPrincipal User user) {
        List<Map<String, Object>> foods = (List<Map<String, Object>>) body.get("foods");
        String mealType = (String) body.getOrDefault("mealType", "SNACK");
        return ResponseEntity.ok(aiService.quickAddFoods(foods, mealType, user));
    }

    @PostMapping("/from-prompt")
    public ResponseEntity<List<FoodLog>> addFromPrompt(@RequestBody Map<String, Object> body,
                                                        @AuthenticationPrincipal User user) {
        String prompt = (String) body.get("prompt");
        String mealType = (String) body.getOrDefault("mealType", null);
        return ResponseEntity.ok(aiService.addFoodsFromPrompt(prompt, mealType, user));
    }

    @GetMapping("/suggestions")
    public ResponseEntity<Map<String, Object>> getSuggestions(
            @RequestParam String q,
            @RequestParam(defaultValue = "8") int limit,
            @AuthenticationPrincipal User user) {
        if (q == null || q.trim().length() < 2) {
            return ResponseEntity.ok(Map.of(
                "frequent", List.of(),
                "catalog", List.of(),
                "manual", Map.of("label", "Ajouter \"" + (q != null ? q.trim() : "") + "\" manuellement")
            ));
        }
        String query = q.trim();
        int boundedLimit = Math.max(1, Math.min(limit, 20));
        String queryLower = query.toLowerCase(Locale.ROOT);

        var cacheResults = foodCacheRepository.searchByFoodNamePrefix(query, boundedLimit);
        var frequent = cacheResults.stream()
            .filter(c -> c.getFoodName().toLowerCase(Locale.ROOT).startsWith(queryLower))
            .sorted(Comparator
                .comparing((FoodCache c) -> Boolean.TRUE.equals(c.getVerified()) ? 0 : 1)
                .thenComparing(c -> c.getHitCount() != null ? -c.getHitCount() : 0))
            .map(this::toCacheSuggestion)
            .toList();

        var cacheNames = cacheResults.stream()
            .map(c -> c.getFoodName().toLowerCase(Locale.ROOT))
            .collect(Collectors.toSet());

        List<Map<String, Object>> catalog = List.of();
        if (frequent.size() < 3) {
            int catalogLimit = Math.max(0, boundedLimit - frequent.size());
            catalog = nutritionApiService.searchMultiple(query, boundedLimit)
                .stream()
                .filter(r -> !cacheNames.contains(r.foodName().toLowerCase(Locale.ROOT)))
                .limit(catalogLimit)
                .map(r -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("name",     r.foodName());
                    m.put("calories", r.calories()  != null ? r.calories()               : 0);
                    m.put("proteinG", r.proteinG()  != null ? r.proteinG().doubleValue() : 0.0);
                    m.put("carbsG",   r.carbsG()    != null ? r.carbsG().doubleValue()   : 0.0);
                    m.put("fatG",     r.fatG()      != null ? r.fatG().doubleValue()     : 0.0);
                    m.put("fiberG",   r.fiberG()    != null ? r.fiberG().doubleValue()   : 0.0);
                    m.put("source",   "usda");
                    m.put("verified", false);
                    return m;
                })
                .collect(Collectors.toList());
        }

        int totalSoFar = frequent.size() + catalog.size();
        List<Map<String, Object>> related = List.of();
        if (totalSoFar < 3) {
            var trgmResults = foodCacheRepository.searchByTrgmSimilarity(query, boundedLimit);
            related = trgmResults.stream()
            .filter(c -> !c.getFoodName().toLowerCase(Locale.ROOT).startsWith(queryLower))
            .filter(c -> !cacheNames.contains(c.getFoodName().toLowerCase(Locale.ROOT)))
            .limit(Math.max(0, boundedLimit - totalSoFar))
            .map(this::toCacheSuggestion)
            .toList();
        }

        Map<String, Object> manual = Map.of("label", "Ajouter \"" + query + "\" manuellement");

        return ResponseEntity.ok(Map.of(
            "frequent", frequent,
            "catalog", catalog,
            "related", related,
            "manual", manual
        ));
    }

    private Map<String, Object> toCacheSuggestion(FoodCache food) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("name",     food.getFoodName());
        m.put("calories", food.getCalories() != null ? food.getCalories().intValue() : 0);
        m.put("proteinG", food.getProteinG() != null ? food.getProteinG().doubleValue() : 0.0);
        m.put("carbsG",   food.getCarbsG()   != null ? food.getCarbsG().doubleValue()   : 0.0);
        m.put("fatG",     food.getFatG()     != null ? food.getFatG().doubleValue()     : 0.0);
        m.put("fiberG",   food.getFiberG()   != null ? food.getFiberG().doubleValue()   : 0.0);
        m.put("source",   "cache");
        m.put("verified", Boolean.TRUE.equals(food.getVerified()));
        m.put("hitCount", food.getHitCount() != null ? food.getHitCount() : 0);
        return m;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFoodLog(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return foodLogRepository.findById(id)
                .filter(f -> f.getUser().getId().equals(user.getId()))
                .map(f -> { foodLogRepository.delete(f); return ResponseEntity.noContent().<Void>build(); })
                .orElse(ResponseEntity.notFound().build());
    }
}
