package com.smartlife.repository;

import com.smartlife.model.SleepPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface SleepPlanRepository extends JpaRepository<SleepPlan, Long> {
    Optional<SleepPlan> findByUserIdAndPlanDate(Long userId, LocalDate planDate);
    List<SleepPlan> findByUserIdAndPlanDateBetweenOrderByPlanDateAsc(Long userId, LocalDate from, LocalDate to);
}
