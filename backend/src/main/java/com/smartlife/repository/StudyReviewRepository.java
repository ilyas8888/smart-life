package com.smartlife.repository;

import com.smartlife.model.StudyReview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface StudyReviewRepository extends JpaRepository<StudyReview, Long> {
    List<StudyReview> findByUserIdAndStatusOrderByReviewDateAsc(Long userId, String status);
    List<StudyReview> findByUserIdAndReviewDateLessThanEqualAndStatusOrderByReviewDateAsc(Long userId, LocalDate reviewDate, String status);
}
