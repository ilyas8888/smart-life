package com.smartlife.repository;

import com.smartlife.model.FoodLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface FoodLogRepository extends JpaRepository<FoodLog, Long> {
    List<FoodLog> findByUserIdOrderByLogDateDescLoggedAtDesc(Long userId);
    List<FoodLog> findByUserIdAndLogDate(Long userId, LocalDate date);
}
