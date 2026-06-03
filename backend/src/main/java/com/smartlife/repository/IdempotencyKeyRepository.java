package com.smartlife.repository;

import com.smartlife.model.IdempotencyKey;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IdempotencyKeyRepository extends JpaRepository<IdempotencyKey, Long> {
    boolean existsByUserIdAndKey(Long userId, String key);
}
