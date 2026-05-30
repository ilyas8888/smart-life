package com.smartlife.repository;

import com.smartlife.model.SocialSave;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SocialSaveRepository extends JpaRepository<SocialSave, Long> {
    Optional<SocialSave> findByPostIdAndUserId(Long postId, Long userId);
    List<SocialSave> findByUserIdOrderByCreatedAtDesc(Long userId);
    void deleteByPostIdAndUserId(Long postId, Long userId);
}
