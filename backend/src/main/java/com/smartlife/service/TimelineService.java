package com.smartlife.service;

import com.smartlife.dto.TimelineItemDto;
import com.smartlife.model.FoodLog;
import com.smartlife.model.DiaryEntry;
import com.smartlife.model.Note;
import com.smartlife.model.WorkoutSession;
import com.smartlife.model.Reminder;
import com.smartlife.model.Task;
import com.smartlife.model.User;
import com.smartlife.repository.FoodLogRepository;
import com.smartlife.repository.DiaryEntryRepository;
import com.smartlife.repository.NoteRepository;
import com.smartlife.repository.WorkoutSessionRepository;
import com.smartlife.repository.ReminderRepository;
import com.smartlife.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TimelineService {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private final TaskRepository taskRepository;
    private final ReminderRepository reminderRepository;
    private final NoteRepository noteRepository;
    private final FoodLogRepository foodLogRepository;
    private final DiaryEntryRepository diaryEntryRepository;
    private final WorkoutSessionRepository workoutSessionRepository;

    @Transactional(readOnly = true)
    public Map<String, List<TimelineItemDto>> getTimeline(User user) {
        Map<String, List<TimelineItemDto>> timeline = new LinkedHashMap<>();
        timeline.put("today", new ArrayList<>());
        timeline.put("tomorrow", new ArrayList<>());
        timeline.put("thisWeek", new ArrayList<>());
        timeline.put("yesterday", new ArrayList<>());
        timeline.put("past", new ArrayList<>());
        timeline.put("noDate", new ArrayList<>());

        taskRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .forEach(task -> addItem(timeline, fromTask(task)));

        reminderRepository.findByUserIdOrderByRemindAtAsc(user.getId())
                .forEach(reminder -> addItem(timeline, fromReminder(reminder)));

        noteRepository.findByUserIdOrderByIsPinnedDescCreatedAtDesc(user.getId())
                .forEach(note -> addItem(timeline, fromNote(note)));

        foodLogRepository.findByUserIdOrderByLogDateDescLoggedAtDesc(user.getId())
                .forEach(foodLog -> addItem(timeline, fromFoodLog(foodLog)));

        diaryEntryRepository.findByUserIdOrderByEntryDateDesc(user.getId())
                .forEach(diaryEntry -> addItem(timeline, fromDiaryEntry(diaryEntry)));

        workoutSessionRepository.findByUserIdOrderBySessionDateDescCreatedAtDesc(user.getId())
                .forEach(session -> addItem(timeline, fromWorkoutSession(session)));

        timeline.values().forEach(items -> items.sort(
                Comparator.comparing(TimelineItemDto::time, Comparator.nullsLast(String::compareTo))
        ));

        return timeline;
    }

    private void addItem(Map<String, List<TimelineItemDto>> timeline, TimelineItemDto item) {
        timeline.get(bucketFor(item.date())).add(item);
    }

    private String bucketFor(LocalDate date) {
        if (date == null) return "noDate";
        LocalDate today = LocalDate.now();
        if (date.equals(today)) return "today";
        if (date.equals(today.plusDays(1))) return "tomorrow";
        if (date.equals(today.minusDays(1))) return "yesterday";
        if (date.isAfter(today)) return "thisWeek";
        return "past";
    }

    private TimelineItemDto fromTask(Task task) {
        LocalDateTime dueDate = task.getDueDate();
        LocalDate date = dueDate == null ? null : dueDate.toLocalDate();
        if (date == null && task.getStatus() == Task.TaskStatus.IN_PROGRESS) {
            date = LocalDate.now();
        }
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("status", task.getStatus());
        metadata.put("priority", task.getPriority());

        return new TimelineItemDto(
                task.getId(),
                "TASK",
                task.getTitle(),
                task.getDescription(),
                date,
                formatTime(dueDate),
                metadata
        );
    }

    private TimelineItemDto fromReminder(Reminder reminder) {
        LocalDateTime remindAt = reminder.getRemindAt();
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("isDone", reminder.isDone());

        return new TimelineItemDto(
                reminder.getId(),
                "REMINDER",
                reminder.getTitle(),
                reminder.getDescription(),
                remindAt == null ? null : remindAt.toLocalDate(),
                formatTime(remindAt),
                metadata
        );
    }

    private TimelineItemDto fromNote(Note note) {
        LocalDateTime createdAt = note.getCreatedAt();
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("isPinned", note.isPinned());

        return new TimelineItemDto(
                note.getId(),
                "NOTE",
                note.getTitle() == null || note.getTitle().isBlank() ? "Note" : note.getTitle(),
                note.getContent(),
                createdAt == null ? null : createdAt.toLocalDate(),
                formatTime(createdAt),
                metadata
        );
    }

    private TimelineItemDto fromFoodLog(FoodLog foodLog) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("calories", foodLog.getCalories());
        metadata.put("mealType", foodLog.getMealType());

        return new TimelineItemDto(
                foodLog.getId(),
                "FOOD",
                foodLog.getFoodItem(),
                foodLog.getNotes(),
                foodLog.getLogDate(),
                null,
                metadata
        );
    }

    private TimelineItemDto fromDiaryEntry(DiaryEntry diaryEntry) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("mood", diaryEntry.getMood());
        metadata.put("tags", diaryEntry.getTags());

        return new TimelineItemDto(
                diaryEntry.getId(),
                "DIARY",
                "Journal",
                diaryEntry.getContent(),
                diaryEntry.getEntryDate(),
                null,
                metadata
        );
    }

    private TimelineItemDto fromWorkoutSession(WorkoutSession session) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("durationMinutes", session.getDurationMinutes());
        metadata.put("caloriesBurned", session.getCaloriesBurned());
        metadata.put("exerciseCount", session.getExercises().size());

        return new TimelineItemDto(
                session.getId(),
                "WORKOUT",
                session.getTitle(),
                session.getNotes(),
                session.getSessionDate(),
                null,
                metadata
        );
    }

    private String formatTime(LocalDateTime dateTime) {
        return dateTime == null ? null : dateTime.format(TIME_FORMATTER);
    }
}
