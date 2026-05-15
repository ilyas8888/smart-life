package com.smartlife.repository;

import com.smartlife.model.OtpCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OtpRepository extends JpaRepository<OtpCode, Long> {
    Optional<OtpCode> findTopByUserIdAndUsedFalseOrderByCreatedAtDesc(Long userId);
}
