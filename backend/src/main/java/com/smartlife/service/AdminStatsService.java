package com.smartlife.service;

import com.smartlife.model.PromptHistory;
import com.smartlife.repository.PromptHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminStatsService {

    private final PromptHistoryRepository promptHistoryRepository;

    public Map<String, Object> getPromptStats() {
        long totalPrompts = promptHistoryRepository.count();
        LocalDate today = LocalDate.now();

        List<Object[]> todayRows = promptHistoryRepository.countByDaySince(today.atStartOfDay());
        long todayCount = todayRows.stream()
                .filter(row -> today.equals(toLocalDate(row[0])))
                .mapToLong(row -> ((Number) row[1]).longValue())
                .findFirst()
                .orElse(0L);

        double avgPerDay = totalPrompts < 1
                ? 0.0
                : Math.round((totalPrompts / 30.0) * 10.0) / 10.0;

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalPrompts", totalPrompts);
        stats.put("todayCount", todayCount);
        stats.put("avgPerDay", avgPerDay);
        stats.put("last30Days", buildLast30Days(today));
        stats.put("topUsers", buildTopUsers());
        stats.put("modulesBreakdown", buildModulesBreakdown());
        return stats;
    }

    private List<Map<String, Object>> buildLast30Days(LocalDate today) {
        LocalDate start = today.minusDays(29);
        List<Object[]> rows = promptHistoryRepository.countByDaySince(start.atStartOfDay());
        Map<LocalDate, Long> countsByDate = new LinkedHashMap<>();
        for (Object[] row : rows) {
            countsByDate.put(toLocalDate(row[0]), ((Number) row[1]).longValue());
        }

        List<Map<String, Object>> last30Days = new ArrayList<>();
        for (int i = 0; i < 30; i++) {
            LocalDate date = start.plusDays(i);
            Map<String, Object> day = new LinkedHashMap<>();
            day.put("date", date.toString());
            day.put("count", countsByDate.getOrDefault(date, 0L));
            last30Days.add(day);
        }
        return last30Days;
    }

    private List<Map<String, Object>> buildTopUsers() {
        return promptHistoryRepository.countByUser(PageRequest.of(0, 5)).stream()
                .map(row -> {
                    Map<String, Object> user = new LinkedHashMap<>();
                    user.put("userId", ((Number) row[0]).longValue());
                    user.put("email", (String) row[1]);
                    user.put("count", ((Number) row[2]).longValue());
                    return user;
                })
                .toList();
    }

    private Map<String, Long> buildModulesBreakdown() {
        Map<String, Long> modulesBreakdown = new LinkedHashMap<>();
        for (PromptHistory promptHistory : promptHistoryRepository.findAll()) {
            Map<String, Object> itemsCreated = promptHistory.getItemsCreated();
            if (itemsCreated == null) {
                continue;
            }
            for (Map.Entry<String, Object> entry : itemsCreated.entrySet()) {
                if (entry.getValue() instanceof Number value) {
                    modulesBreakdown.merge(entry.getKey(), value.longValue(), Long::sum);
                }
            }
        }
        return modulesBreakdown;
    }

    private LocalDate toLocalDate(Object value) {
        if (value instanceof LocalDate localDate) {
            return localDate;
        }
        if (value instanceof Date date) {
            return date.toLocalDate();
        }
        if (value instanceof java.util.Date date) {
            return new Date(date.getTime()).toLocalDate();
        }
        if (value instanceof LocalDateTime dateTime) {
            return dateTime.toLocalDate();
        }
        return LocalDate.parse(String.valueOf(value));
    }
}
