package com.smartlife.repository;

import com.smartlife.model.FoodCache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface FoodCacheRepository extends JpaRepository<FoodCache, Long> {
    Optional<FoodCache> findByFoodNameNormalized(String foodNameNormalized);
    List<FoodCache> findTop20ByOrderByHitCountDesc();
    long countByVerifiedTrue();

    @Query(value = """
        SELECT * FROM food_cache
        WHERE name_embedding IS NOT NULL
          AND 1 - (name_embedding <=> CAST(:emb AS vector)) >= :threshold
        ORDER BY name_embedding <=> CAST(:emb AS vector)
        LIMIT 1
        """, nativeQuery = true)
    Optional<FoodCache> findBySimilarity(@Param("emb") String emb,
                                         @Param("threshold") double threshold);

    @Modifying
    @Transactional
    @Query(value = "UPDATE food_cache SET name_embedding = CAST(:emb AS vector) WHERE food_name_normalized = :normalized",
           nativeQuery = true)
    void updateEmbedding(@Param("normalized") String normalized, @Param("emb") String emb);

    @Query(value = "SELECT * FROM food_cache WHERE nutrition_details->'aliases' @> to_jsonb(CAST(:alias AS text)) LIMIT 1",
           nativeQuery = true)
    Optional<FoodCache> findByAlias(@Param("alias") String alias);

    @Query(value = """
        SELECT * FROM food_cache
        WHERE lower(food_name) LIKE lower(:query || '%')
           OR lower(food_name) LIKE lower('% ' || :query || '%')
        ORDER BY CASE WHEN lower(food_name) LIKE lower(:query || '%') THEN 0 ELSE 1 END,
                 hit_count DESC, last_used_at DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<FoodCache> searchByFoodNamePrefix(@Param("query") String query, @Param("limit") int limit);

    @Query(value = """
        SELECT * FROM food_cache
        WHERE similarity(food_name, :query) > 0.25
        ORDER BY similarity(food_name, :query) DESC,
                 hit_count DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<FoodCache> searchByTrgmSimilarity(@Param("query") String query, @Param("limit") int limit);
}
