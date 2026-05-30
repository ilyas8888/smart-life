package com.smartlife.repository;

import com.smartlife.model.SocialPost;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SocialPostRepository extends JpaRepository<SocialPost, Long> {
    List<SocialPost> findByVisibilityOrderByCreatedAtDesc(String visibility, Pageable pageable);
    List<SocialPost> findByResourceTypeAndVisibilityOrderByCreatedAtDesc(String resourceType, String visibility, Pageable pageable);
    List<SocialPost> findByAuthorIdOrderByCreatedAtDesc(Long authorId);
    long countByAuthorId(Long authorId);
}
