package com.smartlife.repository;

import com.smartlife.model.SocialReaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SocialReactionRepository extends JpaRepository<SocialReaction, Long> {
    Optional<SocialReaction> findByPostIdAndUserId(Long postId, Long userId);
    List<SocialReaction> findByPostId(Long postId);
    void deleteByPostIdAndUserId(Long postId, Long userId);
}
