package com.smartlife.repository;

import com.smartlife.model.SocialComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SocialCommentRepository extends JpaRepository<SocialComment, Long> {
    List<SocialComment> findByPostIdAndParentIdIsNullOrderByCreatedAtAsc(Long postId);
    List<SocialComment> findByParentIdOrderByCreatedAtAsc(Long parentId);
    void deleteByPostId(Long postId);
}
