package com.smartlife.repository;

import com.smartlife.model.StudyTopic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudyTopicRepository extends JpaRepository<StudyTopic, Long> {
    List<StudyTopic> findByUserIdOrderByCreatedAtDesc(Long userId);
}
