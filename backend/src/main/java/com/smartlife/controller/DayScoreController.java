package com.smartlife.controller;

import com.smartlife.model.User;
import com.smartlife.service.DayScoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/score")
@RequiredArgsConstructor
public class DayScoreController {

    private final DayScoreService dayScoreService;

    @GetMapping("/today")
    public Map<String, Object> getToday(@AuthenticationPrincipal User user) {
        LocalDate today = LocalDate.now();

        // Compute 7 days at once (today = index 0, oldest = index 6)
        List<Map<String, Object>> history = new ArrayList<>();
        Map<String, Object> todayScore     = null;
        Map<String, Object> yesterdayScore = null;

        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            Map<String, Object> dayScore = dayScoreService.computeForDate(user.getId(), date);

            Map<String, Object> histEntry = new LinkedHashMap<>();
            histEntry.put("date",  date.toString());
            histEntry.put("total", dayScore.get("total"));
            histEntry.put("band",  dayScore.get("band"));
            history.add(histEntry);

            if (i == 0) todayScore     = dayScore;
            if (i == 1) yesterdayScore = dayScore;
        }

        int delta = (todayScore != null && yesterdayScore != null)
                ? (int) todayScore.get("total") - (int) yesterdayScore.get("total")
                : 0;

        Map<String, Object> result = new LinkedHashMap<>(todayScore != null ? todayScore : Map.of());
        result.put("delta",   delta);
        result.put("history", history);
        return result;
    }
}
