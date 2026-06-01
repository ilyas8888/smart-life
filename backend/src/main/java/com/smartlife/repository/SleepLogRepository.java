package com.smartlife.repository;

import com.smartlife.model.SleepLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface SleepLogRepository extends JpaRepository<SleepLog, Long> {
    List<SleepLog> findByUserIdOrderBySleepDateDesc(Long userId);
    List<SleepLog> findByUserIdAndSleepDateBetweenOrderBySleepDateDesc(Long userId, LocalDate from, LocalDate to);
    Optional<SleepLog> findFirstByUserIdAndSleepDateOrderByIdDesc(Long userId, LocalDate sleepDate);
    Optional<SleepLog> findFirstByUserIdAndSleepDateAndTypeOrderByIdDesc(Long userId, LocalDate sleepDate, String type);
    boolean existsByUserIdAndSleepDateAndType(Long userId, LocalDate sleepDate, String type);
    long countByUserId(Long userId);
}
