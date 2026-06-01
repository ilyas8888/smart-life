package com.smartlife.service;

import com.smartlife.model.SleepLog;
import com.smartlife.model.User;
import com.smartlife.model.UserAiEntitlement;
import com.smartlife.repository.SleepLogRepository;
import com.smartlife.repository.UserAiEntitlementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SleepAiService {

    private static final String PRIMARY_NIGHT = "PRIMARY_NIGHT";

    private final UserAiEntitlementRepository entitlementRepository;
    private final SleepLogRepository sleepLogRepository;
    private final WebClient.Builder webClientBuilder;

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    @Value("${ai.internal.secret}")
    private String aiInternalSecret;

    public Map<String, Object> analyzeAndConsume(User user, String analysisType) {
        UserAiEntitlement entitlement = entitlementRepository.findByUserId(user.getId())
                .orElseGet(() -> entitlementRepository.save(
                        UserAiEntitlement.builder().user(user).build()));

        int used = entitlement.getSleepAiUsed() != null ? entitlement.getSleepAiUsed() : 0;
        int quota = entitlement.getSleepAiQuota() != null ? entitlement.getSleepAiQuota() : 5;
        int cost = "program".equals(analysisType) ? 2 : 1;
        if (used + cost > quota) {
            throw new IllegalArgumentException("SLEEP_AI_QUOTA_EXCEEDED");
        }

        List<SleepLog> logs = findLogs(user.getId(), analysisType);
        List<Map<String, Object>> nights = logs.stream().map(this::toNight).toList();

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("analysis_type", analysisType);
        payload.put("nights", nights);
        payload.put("user_id", user.getId());

        Map<String, Object> response = webClientBuilder.build()
                .post()
                .uri(aiServiceUrl + "/sleep-analysis")
                .contentType(MediaType.APPLICATION_JSON)
                .header("X-Internal-Key", aiInternalSecret)
                .bodyValue(payload)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .timeout(Duration.ofSeconds(30))
                .retryWhen(Retry.fixedDelay(1, Duration.ofSeconds(2)))
                .block();

        entitlement.setSleepAiUsed(used + cost);
        entitlementRepository.save(entitlement);

        Map<String, Object> result = response != null ? new LinkedHashMap<>(response) : new LinkedHashMap<>();
        result.put("sleepAiUsed", used + cost);
        result.put("sleepAiQuota", quota);
        return result;
    }

    private List<SleepLog> findLogs(Long userId, String analysisType) {
        List<SleepLog> logs = sleepLogRepository.findByUserIdOrderBySleepDateDesc(userId).stream()
                .filter(log -> PRIMARY_NIGHT.equals(log.getType()))
                .toList();

        if ("night".equals(analysisType)) {
            LocalDate today = LocalDate.now();
            SleepLog night = sleepLogRepository
                    .findFirstByUserIdAndSleepDateAndTypeOrderByIdDesc(userId, today.minusDays(1), PRIMARY_NIGHT)
                    .or(() -> sleepLogRepository.findFirstByUserIdAndSleepDateAndTypeOrderByIdDesc(userId, today, PRIMARY_NIGHT))
                    .orElseGet(() -> logs.stream()
                            .filter(log -> !log.getSleepDate().isBefore(today.minusDays(7)))
                            .findFirst()
                            .orElse(null));
            return night != null ? List.of(night) : List.of();
        }

        int limit = "program".equals(analysisType) ? 30 : 7;
        return logs.stream().limit(limit).toList();
    }

    private Map<String, Object> toNight(SleepLog log) {
        Map<String, Object> night = new LinkedHashMap<>();
        night.put("date", log.getSleepDate().toString());
        night.put("duration_minutes", ChronoUnit.MINUTES.between(log.getBedtime(), log.getWakeTime()));
        night.put("quality", log.getQuality());
        night.put("energy", log.getEnergy());
        night.put("wake_ups", log.getWakeUps());
        night.put("factors", log.getFactors() != null ? Arrays.asList(log.getFactors()) : List.of());
        return night;
    }
}
