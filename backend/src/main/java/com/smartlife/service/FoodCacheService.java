package com.smartlife.service;

import com.smartlife.model.FoodCache;
import com.smartlife.model.FoodLog;
import com.smartlife.repository.FoodCacheRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.Normalizer;
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
                    // Upgrade de fiabilité uniquement : on promeut la source si la
                    // nouvelle est strictement plus fiable (ex. usda > ai), jamais
                    // de downgrade. On ne réécrit PAS les macros : les FoodLog reçus
                    // ici portent des valeurs déjà mises à l'échelle (par portion),
                    // les écraser corromprait les valeurs de référence du cache.
                    if (sourceRank(source) > sourceRank(cached.getSource())) {
                        cached.setSource(source);
                        cached.setVerified("usda".equals(source));
                    }
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
        // NFD + suppression des diacritiques combinés (é -> e) puis on conserve
        // toutes les lettres Unicode (français, arabe...) et chiffres, au lieu de
        // restreindre à [a-z0-9] qui détruisait accents et caractères non latins.
        String cleaned = Normalizer.normalize(name.trim().toLowerCase(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .replaceAll("[^\\p{L}\\p{N} ]", " ")
                .trim();
        if (cleaned.isEmpty()) return "";
        String[] words = cleaned.split("\\s+");
        Arrays.sort(words);
        return String.join(" ", words);
    }

    /** Fiabilité relative d'une source nutritionnelle (plus haut = plus fiable). */
    private static int sourceRank(String source) {
        if (source == null) return 0;
        return switch (source) {
            case "usda" -> 3;
            case "composite" -> 2;
            case "ai" -> 1;
            default -> 0;
        };
    }
}
