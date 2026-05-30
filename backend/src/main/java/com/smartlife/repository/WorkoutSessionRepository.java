package com.smartlife.repository;

import com.smartlife.model.WorkoutSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, Long> {
    List<WorkoutSession> findByUserIdOrderBySessionDateDescCreatedAtDesc(Long userId);
    List<WorkoutSession> findByUserIdAndSessionDate(Long userId, LocalDate date);
    long countByPlanDayIdIn(List<Long> planDayIds);
    List<WorkoutSession> findByPlanDayIdIn(List<Long> planDayIds);
}
