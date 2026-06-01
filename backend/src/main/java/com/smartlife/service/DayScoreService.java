package com.smartlife.service;

import com.smartlife.model.*;
import com.smartlife.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DayScoreService {

    private final SleepLogRepository sleepLogRepository;
    private final FoodLogRepository foodLogRepository;
    private final TaskRepository taskRepository;
    private final WorkoutSessionRepository workoutSessionRepository;
    private final StudySessionRepository studySessionRepository;
    private final DiaryEntryRepository diaryEntryRepository;

    @Caching(cacheable = {
        @Cacheable(value = "day-score-today",
                   condition = "#date.equals(T(java.time.LocalDate).now())",
                   key = "#userId + ':' + #date"),
        @Cacheable(value = "day-score-history",
                   condition = "!#date.equals(T(java.time.LocalDate).now())",
                   key = "#userId + ':' + #date")
    })
    public Map<String, Object> computeForDate(Long userId, LocalDate date) {

        // ── SLEEP (22%) ──────────────────────────────────────────────────
        // sleep_date = wake_time.toLocalDate() → check today then yesterday
        SleepLog sleepLog = sleepLogRepository.findFirstByUserIdAndSleepDateOrderByIdDesc(userId, date)
                .orElseGet(() -> sleepLogRepository.findFirstByUserIdAndSleepDateOrderByIdDesc(userId, date.minusDays(1)).orElse(null));

        int sleepScore = 0;
        String sleepLabel = "Non logué";
        boolean hasSleep = sleepLog != null;
        if (hasSleep) {
            long mins = ChronoUnit.MINUTES.between(sleepLog.getBedtime(), sleepLog.getWakeTime());
            double h = mins / 60.0;
            int durScore;
            if (h >= 7 && h <= 9)   durScore = 100;
            else if (h > 9)          durScore = 88;
            else if (h >= 6)         durScore = 75;
            else if (h >= 5)         durScore = 55;
            else                     durScore = 30;
            int qualScore   = sleepLog.getQuality() * 20;
            int energyScore = sleepLog.getEnergy() != null ? sleepLog.getEnergy() * 20 : 60;
            int wakeScore   = Math.max(0, 100 - sleepLog.getWakeUps() * 15);
            sleepScore = (int) Math.round(0.50 * durScore + 0.30 * qualScore + 0.15 * energyScore + 0.05 * wakeScore);
            sleepLabel = String.format("%.1fh · qualité %d/5", h, sleepLog.getQuality());
        }

        // ── NUTRITION (20%) ──────────────────────────────────────────────
        List<FoodLog> foodLogs = foodLogRepository.findByUserIdAndLogDate(userId, date);
        int nutritionScore = 0;
        String nutritionLabel = "Non logué";
        boolean hasNutrition = !foodLogs.isEmpty();
        if (hasNutrition) {
            int totalCal  = foodLogs.stream().mapToInt(f -> f.getCalories() != null ? f.getCalories() : 0).sum();
            long mealTypes = foodLogs.stream().map(FoodLog::getMealType).filter(Objects::nonNull).distinct().count();
            int calScore;
            if (totalCal >= 1400 && totalCal <= 2600) calScore = 90;
            else if (totalCal >= 1000 && totalCal <= 3000) calScore = 72;
            else if (totalCal > 0) calScore = 50;
            else calScore = 20;
            int mealBonus = (int) Math.min(mealTypes * 7, 21);
            nutritionScore = Math.min(100, calScore + mealBonus);
            nutritionLabel = totalCal + " kcal · " + foodLogs.size() + " aliment" + (foodLogs.size() > 1 ? "s" : "");
        }

        // ── PRODUCTIVITY (18%) ───────────────────────────────────────────
        List<Task> allTasks = taskRepository.findByUserIdOrderByCreatedAtDesc(userId);
        int productivityScore = 50;
        String productivityLabel = "Aucune tâche";
        boolean hasProductivity = !allTasks.isEmpty();
        if (hasProductivity) {
            long total   = allTasks.size();
            long done    = allTasks.stream().filter(t -> t.getStatus() == Task.TaskStatus.DONE).count();
            long overdue = allTasks.stream()
                    .filter(t -> t.getStatus() != Task.TaskStatus.DONE)
                    .filter(t -> t.getDueDate() != null && t.getDueDate().isBefore(LocalDateTime.now()))
                    .count();
            int completionRate = (int) (done * 100 / total);
            int penalty        = (int) Math.min(overdue * 8, 30);
            productivityScore  = Math.max(0, completionRate - penalty);
            productivityLabel  = done + "/" + total + " complétées";
        }

        // ── WORKOUT (15%) ─────────────────────────────────────────────────
        List<WorkoutSession> workouts = workoutSessionRepository.findByUserIdAndSessionDate(userId, date);
        int workoutScore = 0;
        String workoutLabel = "Pas de séance";
        boolean hasWorkout = !workouts.isEmpty();
        if (hasWorkout) {
            int maxDur = workouts.stream().mapToInt(w -> w.getDurationMinutes() != null ? w.getDurationMinutes() : 0).max().orElse(0);
            workoutScore = 75;
            if (maxDur >= 30) workoutScore += 10;
            if (maxDur >= 60) workoutScore += 15;
            workoutScore = Math.min(100, workoutScore);
            int total = workouts.size();
            workoutLabel = total + " séance" + (total > 1 ? "s" : "");
        }

        // ── STUDY (12%) ──────────────────────────────────────────────────
        LocalDateTime dayStart = date.atStartOfDay();
        LocalDateTime dayEnd   = dayStart.plusDays(1).minusNanos(1);
        List<StudySession> studySessions =
                studySessionRepository.findByUserIdAndStartedAtBetweenOrderByStartedAtDesc(userId, dayStart, dayEnd);
        int studyScore = 0;
        String studyLabel = "Pas de session";
        boolean hasStudy = !studySessions.isEmpty();
        if (hasStudy) {
            int totalMins = studySessions.stream().mapToInt(s -> s.getDurationMinutes() != null ? s.getDurationMinutes() : 0).sum();
            if (totalMins >= 120)     studyScore = 100;
            else if (totalMins >= 60) studyScore = 85;
            else if (totalMins >= 30) studyScore = 70;
            else if (totalMins > 0)   studyScore = 50;
            else                      studyScore = 40;
            studyLabel = totalMins + " min d'étude";
        }

        // ── MOOD / DIARY (8%) ────────────────────────────────────────────
        Optional<DiaryEntry> diaryOpt = diaryEntryRepository.findFirstByUserIdAndEntryDateOrderByIdDesc(userId, date);
        int moodScore = 0;
        String moodLabel = "Pas d'entrée";
        boolean hasMood = diaryOpt.isPresent();
        if (hasMood) {
            String mood = diaryOpt.get().getMood();
            moodScore = mood == null ? 70 : switch (mood.toUpperCase()) {
                case "GREAT", "EXCELLENT", "AMAZING" -> 100;
                case "GOOD", "HAPPY"                 -> 85;
                case "NEUTRAL", "OKAY"               -> 65;
                case "MEH", "SAD", "STRESSED"        -> 45;
                case "BAD", "AWFUL", "TERRIBLE"      -> 25;
                default                              -> 70;
            };
            moodLabel = mood != null ? mood : "Journalisé";
        }

        // ── WEIGHTED BASE SCORE ───────────────────────────────────────────
        double base = sleepScore        * 0.22
                    + nutritionScore    * 0.20
                    + productivityScore * 0.18
                    + workoutScore      * 0.15
                    + studyScore        * 0.12
                    + moodScore         * 0.08;
        int baseScore = (int) Math.round(base);

        // ── SYNERGIES ─────────────────────────────────────────────────────
        List<Map<String, Object>> synergies = new ArrayList<>();
        int synergyBonus = 0;

        if (hasSleep && sleepScore >= 70 && hasNutrition && hasWorkout) {
            synergyBonus += 12;
            synergies.add(Map.of("name", "Triple Crown", "bonus", 12, "description", "Sommeil + Nutrition + Sport"));
        }
        if (hasProductivity && productivityScore >= 65 && studyScore >= 60) {
            synergyBonus += 8;
            synergies.add(Map.of("name", "Focus Day", "bonus", 8, "description", "Productivité + Étude"));
        }

        int finalScore = Math.min(100, baseScore + synergyBonus);

        // ── BAND ─────────────────────────────────────────────────────────
        String band, bandLabel;
        if      (finalScore >= 96) { band = "PERFECT";  bandLabel = "Perfect Day"; }
        else if (finalScore >= 81) { band = "PEAK";     bandLabel = "Peak Day"; }
        else if (finalScore >= 61) { band = "STRONG";   bandLabel = "Strong Day"; }
        else if (finalScore >= 41) { band = "STEADY";   bandLabel = "Steady"; }
        else if (finalScore >= 21) { band = "SLOW";     bandLabel = "Slow Start"; }
        else                       { band = "RECHARGE"; bandLabel = "Recharge Day"; }

        // ── INSIGHT ───────────────────────────────────────────────────────
        String insight = generateInsight(hasSleep, hasNutrition, hasWorkout, hasStudy, hasMood,
                sleepScore, workoutScore, productivityScore);

        // ── BUILD RESPONSE ────────────────────────────────────────────────
        Map<String, Object> modules = new LinkedHashMap<>();
        modules.put("sleep",        module(sleepScore,        22, sleepLabel,        hasSleep));
        modules.put("nutrition",    module(nutritionScore,    20, nutritionLabel,    hasNutrition));
        modules.put("productivity", module(productivityScore, 18, productivityLabel, hasProductivity));
        modules.put("workout",      module(workoutScore,      15, workoutLabel,      hasWorkout));
        modules.put("study",        module(studyScore,        12, studyLabel,        hasStudy));
        modules.put("mood",         module(moodScore,         8,  moodLabel,         hasMood));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total",     finalScore);
        result.put("band",      band);
        result.put("bandLabel", bandLabel);
        result.put("modules",   modules);
        result.put("synergies", synergies);
        result.put("insight",   insight);
        return result;
    }

    // ─────────────────────────────────────────────────────────────────────
    private Map<String, Object> module(int score, int weightPct, String label, boolean present) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("score",   score);
        m.put("weight",  weightPct);
        m.put("label",   label);
        m.put("present", present);
        return m;
    }

    private String generateInsight(boolean hasSleep, boolean hasNutrition, boolean hasWorkout,
                                    boolean hasStudy, boolean hasMood,
                                    int sleepScore, int workoutScore, int productivityScore) {
        if (!hasWorkout)    return "Logguez une séance de sport pour débloquer 15% du score";
        if (!hasSleep)      return "Logguez votre sommeil pour débloquer 22% du score";
        if (!hasNutrition)  return "Logguez vos repas pour débloquer 20% du score";
        if (!hasMood)       return "Écrivez dans votre journal pour +8 pts";
        if (!hasStudy)      return "Une session d'étude ajouterait jusqu'à +12 pts";
        if (sleepScore < 60) return "Améliorez votre sommeil pour booster productivité et énergie";
        if (workoutScore < 75) return "Allongez votre séance sport pour maximiser les synergies";
        if (productivityScore < 50) return "Terminez quelques tâches pour booster la productivité";
        return "Excellent rythme — maintenez cet élan !";
    }
}
