package com.smartlife.repository;

import com.smartlife.model.UserAiEntitlement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserAiEntitlementRepository extends JpaRepository<UserAiEntitlement, Long> {
    Optional<UserAiEntitlement> findByUserId(Long userId);
}
