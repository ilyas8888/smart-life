package com.smartlife.service;

import com.smartlife.model.FoodCache;
import com.smartlife.model.FoodLog;
import com.smartlife.model.User;
import com.smartlife.repository.FoodCacheRepository;
import com.smartlife.repository.FoodLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FoodCacheService {

    private final FoodCacheRepository repo;
    private final FoodLogRepository foodLogRepository;
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
                    entry.setVerified(source != null && source.equals("usda"));
                    entry.setFoodType("ai".equals(source) ? "PREPARED_DISH" : "composite".equals(source) ? "COMPOSITE" : "SIMPLE_INGREDIENT");
                    repo.save(entry);
                    embeddingService.embed(normalized)
                        .ifPresent(vec -> repo.updateEmbedding(normalized, vec));
                }
        );
    }

    public void upsert(FoodLog log, String source, Map<String, Double> portions) {
        upsert(log, source, portions, Map.of());
    }

    public void upsert(FoodLog log, String source, Map<String, Double> portions,
                       Map<String, Object> richPortions) {
        upsert(log, source);
        if (log.getFoodItem() == null || portions == null || portions.isEmpty()) return;

        String normalized = normalize(log.getFoodItem());
        repo.findByFoodNameNormalized(normalized).ifPresent(entry -> {
            Map<String, Object> details = entry.getNutritionDetails() != null
                    ? new HashMap<>(entry.getNutritionDetails())
                    : new HashMap<>();
            if (richPortions != null && !richPortions.isEmpty()) {
                details.put("portions", richPortions);
            } else {
                Map<String, Object> minimalRich = new HashMap<>();
                portions.forEach((unit, grams) ->
                    minimalRich.put(unit, Map.of(
                        "grams", grams,
                        "label", "1 " + unit,
                        "source", source,
                        "confidence", 0.5
                    ))
                );
                details.put("portions", minimalRich);
            }
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

    public List<Map<String, Object>> getUserFoodContext(User user) {
        if (user == null || user.getId() == null) return List.of();

        Map<String, UserFoodAggregate> foodsByName = new LinkedHashMap<>();
        foodLogRepository.findByUserIdOrderByLogDateDescLoggedAtDesc(user.getId()).forEach(log -> {
            if (log.getFoodItem() == null || log.getFoodItem().isBlank()) return;
            String key = normalize(log.getFoodItem());
            foodsByName.compute(key, (ignored, aggregate) -> {
                if (aggregate == null) return new UserFoodAggregate(log);
                aggregate.increment();
                return aggregate;
            });
        });

        return foodsByName.values().stream()
                .sorted(Comparator.comparingInt(UserFoodAggregate::count).reversed()
                        .thenComparing(UserFoodAggregate::lastUsedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(20)
                .map(aggregate -> {
                    FoodLog log = aggregate.representative();
                    return Map.<String, Object>of(
                            "name", log.getFoodItem(),
                            "calories", log.getCalories() != null ? log.getCalories() : 0,
                            "protein_g", log.getProteinG() != null ? log.getProteinG() : 0,
                            "carbs_g", log.getCarbsG() != null ? log.getCarbsG() : 0,
                            "fat_g", log.getFatG() != null ? log.getFatG() : 0,
                            "fiber_g", log.getFiberG() != null ? log.getFiberG() : 0
                    );
                })
                .toList();
    }

    public Optional<FoodCache> findByName(String name) {
        if (name == null) return Optional.empty();
        String normalized = normalize(name);
        Optional<FoodCache> exact = repo.findByFoodNameNormalized(normalized);
        if (exact.isPresent()) return exact;
        Optional<FoodCache> byAlias = repo.findByAlias(normalized);
        if (byAlias.isPresent()) return byAlias;
        return embeddingService.embed(normalized)
            .flatMap(vec -> repo.findBySimilarity(vec, 0.85));
    }

    private String normalize(String name) {
        String[] words = name.trim().toLowerCase().replaceAll("[^a-z0-9 ]", " ").trim().split("\\s+");
        Arrays.sort(words);
        return String.join(" ", words);
    }

    private static class UserFoodAggregate {
        private final FoodLog representative;
        private int count;

        private UserFoodAggregate(FoodLog representative) {
            this.representative = representative;
            this.count = 1;
        }

        private void increment() {
            count++;
        }

        private FoodLog representative() {
            return representative;
        }

        private int count() {
            return count;
        }

        private LocalDateTime lastUsedAt() {
            return representative.getLoggedAt();
        }
    }
}
