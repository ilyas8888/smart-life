package com.smartlife.repository;

import com.smartlife.model.UserFood;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserFoodRepository extends JpaRepository<UserFood, Long> {
    List<UserFood> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<UserFood> findByUserIdAndNameContainingIgnoreCaseOrderByNameAsc(Long userId, String query);
}
