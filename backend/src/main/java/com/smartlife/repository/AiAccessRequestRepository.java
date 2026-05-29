package com.smartlife.repository;

import com.smartlife.model.AiAccessRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AiAccessRequestRepository extends JpaRepository<AiAccessRequest, Long> {
    List<AiAccessRequest> findByStatusOrderByRequestedAtDesc(String status);
    List<AiAccessRequest> findByStatusInOrderByRequestedAtDesc(List<String> statuses);
    long countByStatus(String status);
    long countByStatusAndRequestedAtBefore(String status, LocalDateTime threshold);
    Optional<AiAccessRequest> findTopByUserIdOrderByRequestedAtDesc(Long userId);
}
