package com.smartlife.repository;

import com.smartlife.model.FoodCache;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FoodCacheRepository extends JpaRepository<FoodCache, Long> {
    Optional<FoodCache> findByFoodNameNormalized(String foodNameNormalized);
    List<FoodCache> findTop20ByOrderByHitCountDesc();
}
