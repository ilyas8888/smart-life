package com.smartlife.controller;

import com.smartlife.dto.NutritionSummaryDto;
import com.smartlife.model.FoodLog;
import com.smartlife.model.User;
import com.smartlife.repository.FoodLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/food-logs")
@RequiredArgsConstructor
public class FoodLogController {

    private final FoodLogRepository foodLogRepository;

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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFoodLog(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return foodLogRepository.findById(id)
                .filter(f -> f.getUser().getId().equals(user.getId()))
                .map(f -> { foodLogRepository.delete(f); return ResponseEntity.noContent().<Void>build(); })
                .orElse(ResponseEntity.notFound().build());
    }
}
