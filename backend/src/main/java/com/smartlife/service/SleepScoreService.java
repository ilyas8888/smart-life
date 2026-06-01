package com.smartlife.service;

import com.smartlife.model.SleepLog;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SleepScoreService {

    public int computeScore(SleepLog log) {
        return computeDetail(log).get("score") instanceof Integer score ? score : 0;
    }

    public String computeLabel(SleepLog log) {
        long mins = ChronoUnit.MINUTES.between(log.getBedtime(), log.getWakeTime());
        double h = mins / 60.0;
        return String.format("%.1fh · qualité %d/5", h, log.getQuality());
    }

    public Map<String, Object> computeDetail(SleepLog log) {
        long mins = ChronoUnit.MINUTES.between(log.getBedtime(), log.getWakeTime());
        double h = mins / 60.0;
        int durScore;
        if (h >= 7 && h <= 9)   durScore = 100;
        else if (h > 9)          durScore = 88;
        else if (h >= 6)         durScore = 75;
        else if (h >= 5)         durScore = 55;
        else                     durScore = 30;
        int qualScore   = log.getQuality() * 20;
        int energyScore = log.getEnergy() != null ? log.getEnergy() * 20 : 60;
        int wakeScore   = Math.max(0, 100 - log.getWakeUps() * 15);
        int score = (int) Math.round(0.50 * durScore + 0.30 * qualScore + 0.15 * energyScore + 0.05 * wakeScore);

        Map<String, Object> detail = new LinkedHashMap<>();
        detail.put("score", score);
        detail.put("label", computeLabel(log));
        detail.put("durationScore", durScore);
        detail.put("qualityScore", qualScore);
        detail.put("energyScore", energyScore);
        detail.put("wakeScore", wakeScore);
        return detail;
    }
}
