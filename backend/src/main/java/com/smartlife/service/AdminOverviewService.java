package com.smartlife.service;

import com.smartlife.model.User;
import com.smartlife.repository.AiAccessRequestRepository;
import com.smartlife.repository.UserAiEntitlementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminOverviewService {

    private static final String PENDING = "PENDING";

    private final UserAiEntitlementRepository entitlementRepository;
    private final AiAccessRequestRepository requestRepository;

    public Map<String, Object> getOverview(User admin) {
        Map<String, Long> statsByStatus = new LinkedHashMap<>();
        for (var entitlement : entitlementRepository.findAll()) {
            String status = entitlement.getStatus() != null && !entitlement.getStatus().isBlank()
                    ? entitlement.getStatus().trim().toUpperCase()
                    : "FREE";
            statsByStatus.merge(status, 1L, Long::sum);
        }

        Map<String, Object> overview = new LinkedHashMap<>();
        overview.put("statsByStatus", statsByStatus);
        overview.put("pendingCount", requestRepository.countByStatus(PENDING));
        overview.put("urgentPendingCount", requestRepository.countByStatusAndRequestedAtBefore(
                PENDING,
                LocalDateTime.now().minusHours(24)
        ));
        overview.put("totalUsersCount", entitlementRepository.count());
        return overview;
    }
}
