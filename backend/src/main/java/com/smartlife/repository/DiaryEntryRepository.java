package com.smartlife.repository;

import com.smartlife.model.DiaryEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DiaryEntryRepository extends JpaRepository<DiaryEntry, Long> {
    List<DiaryEntry> findByUserIdOrderByEntryDateDesc(Long userId);
    Optional<DiaryEntry> findFirstByUserIdAndEntryDateOrderByIdDesc(Long userId, LocalDate date);
    long countByUserId(Long userId);
}
