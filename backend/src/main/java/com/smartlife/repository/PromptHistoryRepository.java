package com.smartlife.repository;

import com.smartlife.model.PromptHistory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface PromptHistoryRepository extends JpaRepository<PromptHistory, Long> {
    List<PromptHistory> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT CAST(p.createdAt AS LocalDate), COUNT(p) FROM PromptHistory p " +
            "WHERE p.createdAt >= :since GROUP BY CAST(p.createdAt AS LocalDate) " +
            "ORDER BY CAST(p.createdAt AS LocalDate) ASC")
    List<Object[]> countByDaySince(@Param("since") LocalDateTime since);

    @Query("SELECT p.user.id, p.user.email, COUNT(p) FROM PromptHistory p " +
            "GROUP BY p.user.id, p.user.email ORDER BY COUNT(p) DESC")
    List<Object[]> countByUser(Pageable pageable);
}
