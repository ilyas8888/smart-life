package com.smartlife.repository;

import com.smartlife.model.StudySession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface StudySessionRepository extends JpaRepository<StudySession, Long> {
    List<StudySession> findByUserIdOrderByStartedAtDesc(Long userId);
    List<StudySession> findByUserIdAndStartedAtBetweenOrderByStartedAtDesc(Long userId, LocalDateTime from, LocalDateTime to);
    Optional<StudySession> findFirstByUserIdAndEndedAtIsNullOrderByStartedAtDesc(Long userId);
}
