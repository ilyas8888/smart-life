package com.smartlife.service;

import com.smartlife.model.AuditLog;
import com.smartlife.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository repo;

    public List<AuditLog> getRecentAiLogs() {
        return repo.findByActionStartingWithOrderByCreatedAtDesc("AI_").stream()
                .limit(50)
                .toList();
    }

    public void log(Long userId, String action, String entityType, Long entityId, String ip) {
        try {
            repo.save(AuditLog.builder()
                    .userId(userId)
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .ipAddress(ip)
                    .build());
        } catch (Exception e) {
            log.warn("Audit log failed errorType={}", e.getClass().getSimpleName());
        }
    }
}
