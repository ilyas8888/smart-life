package com.smartlife.repository;

import com.smartlife.model.AiAccessRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AiAccessRequestRepository extends JpaRepository<AiAccessRequest, Long> {
    List<AiAccessRequest> findByStatusOrderByRequestedAtDesc(String status);
    Optional<AiAccessRequest> findTopByUserIdOrderByRequestedAtDesc(Long userId);
}
