package com.smartlife.service;

import com.smartlife.model.FoodCache;
import com.smartlife.model.FoodLog;
import com.smartlife.repository.FoodCacheRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FoodCacheService {

    private final FoodCacheRepository repo;

    public void upsert(FoodLog log) {
        if (log.getFoodItem() == null) return;
        String normalized = normalize(log.getFoodItem());
        repo.findByFoodNameNormalized(normalized).ifPresentOrElse(
                cached -> {
                    cached.setHitCount(cached.getHitCount() + 1);
                    cached.setLastUsedAt(LocalDateTime.now());
                    repo.save(cached);
                },
                () -> {
                    FoodCache entry = new FoodCache();
                    entry.setFoodName(log.getFoodItem());
                    entry.setFoodNameNormalized(normalized);
                    entry.setCalories(log.getCalories() != null ? BigDecimal.valueOf(log.getCalories()) : null);
                    entry.setProteinG(log.getProteinG());
                    entry.setCarbsG(log.getCarbsG());
                    entry.setFatG(log.getFatG());
                    entry.setFiberG(log.getFiberG());
                    entry.setNutritionDetails(log.getNutritionDetails());
                    repo.save(entry);
                }
        );
    }

    public List<Map<String, Object>> getTopCachedFoods() {
        return repo.findTop20ByOrderByHitCountDesc().stream()
                .map(c -> Map.<String, Object>of(
                        "name", c.getFoodName(),
                        "calories", c.getCalories() != null ? c.getCalories() : 0,
                        "protein_g", c.getProteinG() != null ? c.getProteinG() : 0,
                        "carbs_g", c.getCarbsG() != null ? c.getCarbsG() : 0,
                        "fat_g", c.getFatG() != null ? c.getFatG() : 0,
                        "fiber_g", c.getFiberG() != null ? c.getFiberG() : 0
                ))
                .toList();
    }

    public Optional<FoodCache> findByName(String name) {
        if (name == null) return Optional.empty();
        return repo.findByFoodNameNormalized(normalize(name));
    }

    private String normalize(String name) {
        return name.trim().toLowerCase().replaceAll("\\s+", " ");
    }
}
