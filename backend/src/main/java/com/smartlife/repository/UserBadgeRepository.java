package com.smartlife.repository;

import com.smartlife.model.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {
    List<UserBadge> findByUserId(Long userId);
    Optional<UserBadge> findByUserIdAndBadgeType(Long userId, String badgeType);
    boolean existsByUserIdAndBadgeType(Long userId, String badgeType);
}
