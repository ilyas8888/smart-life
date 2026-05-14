package com.smartlife.repository;

import com.smartlife.model.PromptHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PromptHistoryRepository extends JpaRepository<PromptHistory, Long> {
    List<PromptHistory> findByUserIdOrderByCreatedAtDesc(Long userId);
}
