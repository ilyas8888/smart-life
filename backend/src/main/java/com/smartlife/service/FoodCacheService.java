package com.smartlife.service;

import com.smartlife.model.FoodCache;
import com.smartlife.model.FoodLog;
import com.smartlife.repository.FoodCacheRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FoodCacheService {

    private final FoodCacheRepository repo;
    private final EmbeddingService embeddingService;

    public void upsert(FoodLog log) {
        upsert(log, "ai");
    }

    public void upsert(FoodLog log, String source) {
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
                    entry.setSource(source);
                    repo.save(entry);
                    embeddingService.embed(normalized)
                        .ifPresent(vec -> repo.updateEmbedding(normalized, vec));
                }
        );
    }

    public void upsert(FoodLog log, String source, Map<String, Double> portions) {
        upsert(log, source);
        if (log.getFoodItem() == null || portions == null || portions.isEmpty()) return;

        String normalized = normalize(log.getFoodItem());
        repo.findByFoodNameNormalized(normalized).ifPresent(entry -> {
            Map<String, Object> details = entry.getNutritionDetails() != null
                    ? new HashMap<>(entry.getNutritionDetails())
                    : new HashMap<>();
            details.put("portions", portions);
            entry.setNutritionDetails(details);
            repo.save(entry);
        });
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
        String normalized = normalize(name);
        Optional<FoodCache> exact = repo.findByFoodNameNormalized(normalized);
        if (exact.isPresent()) return exact;
        return embeddingService.embed(normalized)
            .flatMap(vec -> repo.findBySimilarity(vec, 0.85));
    }

    private String normalize(String name) {
        String[] words = name.trim().toLowerCase().replaceAll("[^a-z0-9 ]", " ").trim().split("\\s+");
        Arrays.sort(words);
        return String.join(" ", words);
    }
}
