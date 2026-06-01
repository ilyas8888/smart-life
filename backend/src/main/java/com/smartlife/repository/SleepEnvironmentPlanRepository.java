package com.smartlife.repository;

import com.smartlife.model.SleepEnvironmentPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SleepEnvironmentPlanRepository extends JpaRepository<SleepEnvironmentPlan, Long> {
    Optional<SleepEnvironmentPlan> findByUserId(Long userId);
}
