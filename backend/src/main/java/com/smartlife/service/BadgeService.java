package com.smartlife.service;

import com.smartlife.model.User;
import com.smartlife.model.UserBadge;
import com.smartlife.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class BadgeService {

    private final UserBadgeRepository badgeRepository;
    private final FoodLogRepository   foodLogRepository;
    private final WorkoutSessionRepository workoutRepository;
    private final StudySessionRepository   studyRepository;
    private final DiaryEntryRepository     diaryRepository;
    private final SleepLogRepository       sleepRepository;
    private final TaskRepository           taskRepository;
    private final SocialPostRepository     socialPostRepository;

    // Badge metadata shown on frontend
    public static final Map<String, Map<String, String>> BADGE_META = new LinkedHashMap<>();
    static {
        BADGE_META.put("FIRST_STEP",       meta("Premier pas",       "Créer votre profil SmartLife",           "🌟", "#F59E0B"));
        BADGE_META.put("FOOD_TRACKER",     meta("Food Tracker",      "Logger 10 repas ou plus",                 "🥗", "#10B981"));
        BADGE_META.put("ATHLETE",          meta("Athlète",           "Compléter 5 séances de sport",            "💪", "#F97316"));
        BADGE_META.put("SCHOLAR",          meta("Érudit",            "Réaliser 3 sessions d'étude",             "📚", "#6366F1"));
        BADGE_META.put("STORYTELLER",      meta("Conteur",           "Écrire 5 entrées dans le journal",        "✍️",  "#EC4899"));
        BADGE_META.put("SLEEP_GUARDIAN",   meta("Gardien du Sommeil","Logger 5 nuits de sommeil",               "😴", "#8B5CF6"));
        BADGE_META.put("TASK_MASTER",      meta("Task Master",       "Créer 10 tâches",                         "✅", "#0EA5E9"));
        BADGE_META.put("SOCIAL_BUTTERFLY", meta("Social Butterfly",  "Publier 5 posts dans Together",           "🦋", "#A855F7"));
    }

    private static Map<String, String> meta(String name, String description, String emoji, String color) {
        return Map.of("name", name, "description", description, "emoji", emoji, "color", color);
    }

    @Transactional
    public List<Map<String, Object>> computeAndAward(User user) {
        Long uid = user.getId();

        Map<String, Boolean> earned = new LinkedHashMap<>();
        earned.put("FIRST_STEP",       true); // always earned once profile exists
        earned.put("FOOD_TRACKER",     foodLogRepository.countByUserId(uid) >= 10);
        earned.put("ATHLETE",          workoutRepository.countByUserId(uid) >= 5);
        earned.put("SCHOLAR",          studyRepository.countByUserId(uid) >= 3);
        earned.put("STORYTELLER",      diaryRepository.countByUserId(uid) >= 5);
        earned.put("SLEEP_GUARDIAN",   sleepRepository.countByUserId(uid) >= 5);
        earned.put("TASK_MASTER",      taskRepository.countByUserId(uid) >= 10);
        earned.put("SOCIAL_BUTTERFLY", socialPostRepository.countByAuthorId(uid) >= 5);

        // Persist newly earned badges
        earned.forEach((type, isEarned) -> {
            if (isEarned && !badgeRepository.existsByUserIdAndBadgeType(uid, type)) {
                badgeRepository.save(UserBadge.builder().user(user).badgeType(type).build());
            }
        });

        // Fetch earned dates
        Map<String, String> earnedDates = new HashMap<>();
        badgeRepository.findByUserId(uid)
                .forEach(b -> earnedDates.put(b.getBadgeType(), b.getEarnedAt().toString()));

        // Build response: all badges with earned flag + date
        return BADGE_META.entrySet().stream().map(entry -> {
            String type    = entry.getKey();
            boolean isEarned = earned.getOrDefault(type, false);
            Map<String, Object> b = new LinkedHashMap<>(entry.getValue());
            b.put("type",     type);
            b.put("earned",   isEarned);
            b.put("earnedAt", isEarned ? earnedDates.get(type) : null);
            return b;
        }).toList();
    }
}
