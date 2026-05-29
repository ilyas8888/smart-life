package com.smartlife.repository;

import com.smartlife.model.EmailLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmailLogRepository extends JpaRepository<EmailLog, Long> {
    List<EmailLog> findTop50ByOrderByCreatedAtDesc();
    long countByStatus(String status);
}
