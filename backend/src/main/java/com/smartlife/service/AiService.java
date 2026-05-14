package com.smartlife.service;

import com.smartlife.dto.PromptRequest;
import com.smartlife.dto.PromptResponse;
import com.smartlife.model.*;
import com.smartlife.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiService {

    private final WebClient.Builder webClientBuilder;
    private final TaskRepository taskRepository;
    private final ReminderRepository reminderRepository;
    private final NoteRepository noteRepository;
    private final ContactRepository contactRepository;
    private final FoodLogRepository foodLogRepository;
    private final DiaryEntryRepository diaryEntryRepository;
    private final PromptHistoryRepository promptHistoryRepository;

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    @SuppressWarnings("unchecked")
    public PromptResponse processPrompt(String rawPrompt, User user) {
        // Call Python AI service
        Map<String, Object> aiResult = webClientBuilder.build()
                .post()
                .uri(aiServiceUrl + "/process")
                .bodyValue(Map.of("prompt", rawPrompt, "user_id", user.getId()))
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (aiResult == null) {
            throw new RuntimeException("AI service returned no response");
        }

        PromptResponse response = new PromptResponse();
        response.setSummary((String) aiResult.getOrDefault("summary", ""));
        response.setRawAiResponse(aiResult.toString());

        List<Map<String, Object>> tasksCreated = new ArrayList<>();
        List<Map<String, Object>> remindersCreated = new ArrayList<>();
        List<Map<String, Object>> notesCreated = new ArrayList<>();
        List<Map<String, Object>> contactsCreated = new ArrayList<>();
        List<Map<String, Object>> foodLogsCreated = new ArrayList<>();

        // Persist tasks
        var tasks = (List<Map<String, Object>>) aiResult.getOrDefault("tasks", List.of());
        for (var t : tasks) {
            var task = Task.builder()
                    .user(user)
                    .title((String) t.get("title"))
                    .description((String) t.getOrDefault("description", ""))
                    .priority(parsePriority((String) t.getOrDefault("priority", "MEDIUM")))
                    .status(Task.TaskStatus.TODO)
                    .build();
            taskRepository.save(task);
            tasksCreated.add(Map.of("id", task.getId(), "title", task.getTitle()));
        }

        // Persist reminders
        var reminders = (List<Map<String, Object>>) aiResult.getOrDefault("reminders", List.of());
        for (var r : reminders) {
            var reminder = Reminder.builder()
                    .user(user)
                    .title((String) r.get("title"))
                    .description((String) r.getOrDefault("description", ""))
                    .remindAt(parseDateTime((String) r.getOrDefault("remind_at", null)))
                    .build();
            reminderRepository.save(reminder);
            remindersCreated.add(Map.of("id", reminder.getId(), "title", reminder.getTitle()));
        }

        // Persist notes
        var notes = (List<Map<String, Object>>) aiResult.getOrDefault("notes", List.of());
        for (var n : notes) {
            var note = Note.builder()
                    .user(user)
                    .title((String) n.getOrDefault("title", "Note"))
                    .content((String) n.get("content"))
                    .build();
            noteRepository.save(note);
            notesCreated.add(Map.of("id", note.getId(), "title", note.getTitle()));
        }

        // Persist contacts
        var contacts = (List<Map<String, Object>>) aiResult.getOrDefault("contacts", List.of());
        for (var c : contacts) {
            var contact = Contact.builder()
                    .user(user)
                    .name((String) c.get("name"))
                    .phone((String) c.getOrDefault("phone", null))
                    .email((String) c.getOrDefault("email", null))
                    .address((String) c.getOrDefault("address", null))
                    .notes((String) c.getOrDefault("notes", null))
                    .build();
            contactRepository.save(contact);
            contactsCreated.add(Map.of("id", contact.getId(), "name", contact.getName()));
        }

        // Persist food logs
        var foodLogs = (List<Map<String, Object>>) aiResult.getOrDefault("food_logs", List.of());
        for (var f : foodLogs) {
            var foodLog = FoodLog.builder()
                    .user(user)
                    .logDate(LocalDate.now())
                    .mealType((String) f.getOrDefault("meal_type", null))
                    .foodItem((String) f.get("food_item"))
                    .calories(parseInteger(f.get("calories")))
                    .proteinG(parseBigDecimal(f.get("protein_g")))
                    .carbsG(parseBigDecimal(f.get("carbs_g")))
                    .fatG(parseBigDecimal(f.get("fat_g")))
                    .fiberG(parseBigDecimal(f.get("fiber_g")))
                    .quantity((String) f.getOrDefault("quantity", null))
                    .nutritionDetails((Map<String, Object>) f.getOrDefault("nutrition_details", null))
                    .notes((String) f.getOrDefault("notes", null))
                    .build();
            foodLogRepository.save(foodLog);
            foodLogsCreated.add(Map.of("id", foodLog.getId(), "foodItem", foodLog.getFoodItem()));
        }

        response.setTasksCreated(tasksCreated);
        response.setRemindersCreated(remindersCreated);
        response.setNotesCreated(notesCreated);
        response.setContactsCreated(contactsCreated);

        // Save prompt history
        var history = PromptHistory.builder()
                .user(user)
                .rawPrompt(rawPrompt)
                .aiResponse(aiResult)
                .itemsCreated(Map.of(
                        "tasks", tasksCreated.size(),
                        "reminders", remindersCreated.size(),
                        "notes", notesCreated.size(),
                        "contacts", contactsCreated.size(),
                        "food_logs", foodLogsCreated.size()
                ))
                .build();
        promptHistoryRepository.save(history);

        return response;
    }

    private Task.Priority parsePriority(String p) {
        try { return Task.Priority.valueOf(p.toUpperCase()); }
        catch (Exception e) { return Task.Priority.MEDIUM; }
    }

    private LocalDateTime parseDateTime(String s) {
        if (s == null || s.isBlank()) return LocalDateTime.now().plusHours(1);
        try { return LocalDateTime.parse(s); }
        catch (Exception e) { return LocalDateTime.now().plusHours(1); }
    }

    private Integer parseInteger(Object value) {
        if (value == null) return null;
        if (value instanceof Number number) return number.intValue();
        try { return Integer.parseInt(value.toString()); }
        catch (Exception e) { return null; }
    }

    private BigDecimal parseBigDecimal(Object value) {
        if (value == null) return null;
        if (value instanceof Number number) return BigDecimal.valueOf(number.doubleValue());
        try { return new BigDecimal(value.toString()); }
        catch (Exception e) { return null; }
    }
}
