package com.smartlife.repository;

import com.smartlife.model.WorkoutPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WorkoutPlanRepository extends JpaRepository<WorkoutPlan, Long> {
    List<WorkoutPlan> findByUserIdOrderByCreatedAtDesc(Long userId);
}
