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
    private final WorkoutSessionRepository workoutSessionRepository;
    private final PromptHistoryRepository promptHistoryRepository;
    private final FoodCacheService foodCacheService;
    private final NutritionApiService nutritionApiService;
    private final AuditLogService auditLogService;

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    @Value("${ai.internal.secret}")
    private String aiInternalSecret;

    @SuppressWarnings("unchecked")
    public PromptResponse processPrompt(String rawPrompt, User user, String ip) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("prompt", rawPrompt);
        requestBody.put("user_id", user.getId());
        requestBody.put("cached_foods", foodCacheService.getTopCachedFoods());

        // Call Python AI service
        Map<String, Object> aiResult = webClientBuilder.build()
                .post()
                .uri(aiServiceUrl + "/process")
                .header("X-Internal-Key", aiInternalSecret)
                .bodyValue(requestBody)
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
        List<Map<String, Object>> diaryEntriesCreated = new ArrayList<>();
        List<Map<String, Object>> workoutsCreated = new ArrayList<>();

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
            foodCacheService.upsert(foodLog);
            foodLogsCreated.add(Map.of("id", foodLog.getId(), "title", foodLog.getFoodItem()));
        }

        // Persist diary entries
        var diaryEntries = (List<Map<String, Object>>) aiResult.getOrDefault("diary", List.of());
        for (var d : diaryEntries) {
            var content = (String) d.get("content");
            if (content == null || content.isBlank()) continue;
            var diaryEntry = DiaryEntry.builder()
                    .user(user)
                    .content(content)
                    .mood(normalizeMood((String) d.getOrDefault("mood", null)))
                    .tags(parseStringArray(d.get("tags")))
                    .entryDate(LocalDate.now())
                    .build();
            diaryEntryRepository.save(diaryEntry);
            diaryEntriesCreated.add(Map.of("id", diaryEntry.getId(), "title", "Journal"));
        }

        // Persist workouts
        var workouts = (List<Map<String, Object>>) aiResult.getOrDefault("workouts", List.of());
        for (var w : workouts) {
            var title = (String) w.get("title");
            if (title == null || title.isBlank()) continue;
            var session = WorkoutSession.builder()
                    .user(user)
                    .title(title)
                    .durationMinutes(parseInteger(w.get("duration_minutes")))
                    .caloriesBurned(parseInteger(w.get("calories_burned")))
                    .notes((String) w.getOrDefault("notes", null))
                    .build();
            var exercises = (List<Map<String, Object>>) w.getOrDefault("exercises", List.of());
            for (var ex : exercises) {
                var exName = (String) ex.getOrDefault("name", "Exercice");
                if (exName == null || exName.isBlank()) continue;
                session.getExercises().add(WorkoutExercise.builder()
                        .session(session)
                        .name(exName)
                        .sets(parseInteger(ex.get("sets")))
                        .reps(parseInteger(ex.get("reps")))
                        .weightKg(parseBigDecimal(ex.get("weight_kg")))
                        .durationSeconds(parseInteger(ex.get("duration_seconds")))
                        .build());
            }
            workoutSessionRepository.save(session);
            workoutsCreated.add(Map.of("id", session.getId(), "title", session.getTitle()));
        }

        response.setTasksCreated(tasksCreated);
        response.setRemindersCreated(remindersCreated);
        response.setNotesCreated(notesCreated);
        response.setContactsCreated(contactsCreated);
        response.setFoodLogsCreated(foodLogsCreated);
        response.setDiaryEntriesCreated(diaryEntriesCreated);
        response.setWorkoutsCreated(workoutsCreated);

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
                        "food_logs", foodLogsCreated.size(),
                        "diary", diaryEntriesCreated.size(),
                        "workouts", workoutsCreated.size()
                ))
                .build();
        promptHistoryRepository.save(history);
        auditLogService.log(user.getId(), "PROMPT_PROCESSED", "PROMPT_HISTORY", history.getId(), ip);

        return response;
    }

    @SuppressWarnings("unchecked")
    public List<FoodLog> quickAddFoods(List<Map<String, Object>> foods, String mealType, User user) {
        List<FoodLog> result = new ArrayList<>();
        List<Map<String, Object>> toDecompose = new ArrayList<>();
        List<Map<String, Object>> toAsk = new ArrayList<>();

        for (var food : foods) {
            String name = (String) food.get("name");
            String quantity = (String) food.getOrDefault("quantity", null);
            String unit = (String) food.getOrDefault("unit", "g");
            String quantityWithUnit = quantity == null || quantity.isBlank() ? null : quantity + " " + unit;
            var cached = foodCacheService.findByName(name);
            if (cached.isPresent()) {
                var c = cached.get();
                if ("ai".equals(c.getSource())) {
                    Double servingG = extractServingG(c.getNutritionDetails());
                    double scale = computeAiScale(quantity, unit, servingG);
                    var log = FoodLog.builder()
                            .user(user).logDate(LocalDate.now()).mealType(mealType)
                            .foodItem(c.getFoodName())
                            .calories(scaleCalories(c.getCalories(), scale))
                            .proteinG(scaleBigDecimal(c.getProteinG(), scale))
                            .carbsG(scaleBigDecimal(c.getCarbsG(), scale))
                            .fatG(scaleBigDecimal(c.getFatG(), scale))
                            .fiberG(scaleBigDecimal(c.getFiberG(), scale))
                            .quantity(quantityWithUnit).nutritionDetails(c.getNutritionDetails())
                            .build();
                    foodLogRepository.save(log);
                    foodCacheService.upsert(log);
                    result.add(log);
                    continue;
                }
                Map<String, Double> portions = extractPortions(c.getNutritionDetails());
                double scale = scaleFactor(quantity, unit, portions);
                if (scale == -1.0) {
                    toDecompose.add(foodWithUnit(food, unit));
                    continue;
                }
                var log = FoodLog.builder()
                        .user(user).logDate(LocalDate.now()).mealType(mealType)
                        .foodItem(c.getFoodName())
                        .calories(scaleCalories(c.getCalories(), scale))
                        .proteinG(scaleBigDecimal(c.getProteinG(), scale)).carbsG(scaleBigDecimal(c.getCarbsG(), scale))
                        .fatG(scaleBigDecimal(c.getFatG(), scale)).fiberG(scaleBigDecimal(c.getFiberG(), scale))
                        .quantity(quantityWithUnit).nutritionDetails(c.getNutritionDetails())
                        .build();
                foodLogRepository.save(log);
                foodCacheService.upsert(log);
                result.add(log);
            } else if (isWeightUnit(unit) && isSimpleIngredient(name) && quantity != null && !quantity.isBlank()) {
                var apiResult = nutritionApiService.lookup(name);
                if (apiResult.isPresent()) {
                    var nr = apiResult.get();
                    double scale = scaleFactor(quantity, unit, nr.portions());
                    if (scale > 0) {
                        var log = FoodLog.builder()
                                .user(user).logDate(LocalDate.now()).mealType(mealType)
                                .foodItem(name)
                                .calories(scaleCalories(nr.calories(), scale))
                                .proteinG(scaleBD(nr.proteinG(), scale)).carbsG(scaleBD(nr.carbsG(), scale))
                                .fatG(scaleBD(nr.fatG(), scale)).fiberG(scaleBD(nr.fiberG(), scale))
                                .quantity(quantityWithUnit)
                                .build();
                        foodLogRepository.save(log);
                        foodCacheService.upsert(log, nr.source(), nr.portions());
                        result.add(log);
                    } else {
                        toDecompose.add(foodWithUnit(food, unit));
                    }
                } else {
                    toDecompose.add(foodWithUnit(food, unit));
                }
            } else {
                toDecompose.add(foodWithUnit(food, unit));
            }
        }

        if (!toDecompose.isEmpty()) {
            Map<String, String> originalQuantities = new HashMap<>();
            for (var food : toDecompose) {
                String name = (String) food.get("name");
                String quantity = (String) food.getOrDefault("quantity", null);
                String unit = (String) food.getOrDefault("unit", "g");
                originalQuantities.put(normalizeKey(name), quantity == null || quantity.isBlank() ? null : quantity + " " + unit);
            }

            Map<String, Object> decomposeBody = new HashMap<>();
            decomposeBody.put("foods", toDecompose);

            Map<String, Object> decomposeResult = webClientBuilder.build()
                    .post().uri(aiServiceUrl + "/decompose-foods")
                    .header("X-Internal-Key", aiInternalSecret)
                    .bodyValue(decomposeBody).retrieve()
                    .bodyToMono(Map.class).block();

            if (decomposeResult != null) {
                for (var item : (List<Map<String, Object>>) decomposeResult.getOrDefault("items", List.of())) {
                    if (Boolean.TRUE.equals(item.get("compute_directly"))) {
                        var nutrition = (Map<String, Object>) item.get("nutrition");
                        if (nutrition == null) continue;
                        Map<String, Object> details = new HashMap<>();
                        String servingSize = (String) nutrition.get("serving_size");
                        Integer servingGrams = parseInteger(nutrition.get("serving_g"));
                        if (servingSize != null) details.put("serving_size", servingSize);
                        if (servingGrams != null) details.put("serving_g", servingGrams);
                        var rawAliases = nutrition.get("aliases");
                        if (rawAliases instanceof List<?> aliasList && !aliasList.isEmpty()) {
                            details.put("aliases", aliasList.stream()
                                .filter(a -> a != null)
                                .map(Object::toString)
                                .map(a -> a.trim().toLowerCase().replaceAll("[^a-z0-9 ]", " ").trim().replaceAll("\\s+", " "))
                                .filter(a -> !a.isBlank())
                                .toList());
                        }
                        var log = FoodLog.builder()
                                .user(user).logDate(LocalDate.now()).mealType(mealType)
                                .foodItem((String) nutrition.getOrDefault("food_item", item.getOrDefault("original", "Aliment")))
                                .calories(parseInteger(nutrition.get("calories")))
                                .proteinG(parseBigDecimal(nutrition.get("protein_g")))
                                .carbsG(parseBigDecimal(nutrition.get("carbs_g")))
                                .fatG(parseBigDecimal(nutrition.get("fat_g")))
                                .fiberG(parseBigDecimal(nutrition.get("fiber_g")))
                                .quantity(originalQuantities.get(normalizeKey((String) item.get("original"))))
                                .nutritionDetails(details.isEmpty() ? null : details)
                                .build();
                        foodLogRepository.save(log);
                        foodCacheService.upsert(log, "ai");
                        result.add(log);
                        continue;
                    }

                    String original = (String) item.get("original");
                    Integer calories = 0;
                    BigDecimal protein = BigDecimal.ZERO;
                    BigDecimal carbs = BigDecimal.ZERO;
                    BigDecimal fat = BigDecimal.ZERO;
                    BigDecimal fiber = BigDecimal.ZERO;
                    boolean foundAny = false;

                    for (var term : (List<Map<String, Object>>) item.getOrDefault("terms", List.of())) {
                        String termName = (String) term.get("name");
                        Integer quantityG = parseInteger(term.get("quantity_g"));
                        if (termName == null || termName.isBlank() || quantityG == null) {
                            Map<String, Object> fallback = new HashMap<>();
                            fallback.put("name", termName != null ? termName : original);
                            if (quantityG != null) fallback.put("quantity", String.valueOf(quantityG));
                            fallback.put("unit", "g");
                            toAsk.add(fallback);
                            continue;
                        }

                        double scale = quantityG / 100.0;
                        var cachedTerm = foodCacheService.findByName(termName);
                        if (cachedTerm.isPresent()) {
                            var c = cachedTerm.get();
                            calories += scaleCalories(c.getCalories(), scale) != null ? scaleCalories(c.getCalories(), scale) : 0;
                            protein = protein.add(nullToZero(scaleBD(c.getProteinG(), scale)));
                            carbs = carbs.add(nullToZero(scaleBD(c.getCarbsG(), scale)));
                            fat = fat.add(nullToZero(scaleBD(c.getFatG(), scale)));
                            fiber = fiber.add(nullToZero(scaleBD(c.getFiberG(), scale)));
                            foundAny = true;
                            continue;
                        }

                        var apiResult = nutritionApiService.lookup(termName);
                        if (apiResult.isPresent()) {
                            var nr = apiResult.get();
                            var cacheLog = FoodLog.builder()
                                    .user(user).logDate(LocalDate.now()).mealType(mealType)
                                    .foodItem(termName)
                                    .calories(nr.calories())
                                    .proteinG(nr.proteinG()).carbsG(nr.carbsG())
                                    .fatG(nr.fatG()).fiberG(nr.fiberG())
                                    .build();
                            foodCacheService.upsert(cacheLog, nr.source(), nr.portions());
                            calories += scaleCalories(nr.calories(), scale) != null ? scaleCalories(nr.calories(), scale) : 0;
                            protein = protein.add(nullToZero(scaleBD(nr.proteinG(), scale)));
                            carbs = carbs.add(nullToZero(scaleBD(nr.carbsG(), scale)));
                            fat = fat.add(nullToZero(scaleBD(nr.fatG(), scale)));
                            fiber = fiber.add(nullToZero(scaleBD(nr.fiberG(), scale)));
                            foundAny = true;
                        } else {
                            toAsk.add(Map.of("name", termName, "quantity", String.valueOf(quantityG), "unit", "g"));
                        }
                    }

                    if (foundAny) {
                        var combined = FoodLog.builder()
                                .user(user).logDate(LocalDate.now()).mealType(mealType)
                                .foodItem(original != null ? original : "Aliment")
                                .calories(calories)
                                .proteinG(protein).carbsG(carbs)
                                .fatG(fat).fiberG(fiber)
                                .quantity(originalQuantities.get(normalizeKey(original)))
                                .build();
                        foodLogRepository.save(combined);
                        foodCacheService.upsert(combined, "usda");
                        result.add(combined);
                    }
                }
            }
        }

        if (!toAsk.isEmpty()) {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("foods", toAsk);
            requestBody.put("meal_type", mealType);
            requestBody.put("cached_foods", foodCacheService.getTopCachedFoods());

            Map<String, Object> aiResult = webClientBuilder.build()
                    .post().uri(aiServiceUrl + "/extract-food")
                    .header("X-Internal-Key", aiInternalSecret)
                    .bodyValue(requestBody).retrieve()
                    .bodyToMono(Map.class).block();

            if (aiResult != null) {
                for (var f : (List<Map<String, Object>>) aiResult.getOrDefault("food_logs", List.of())) {
                    var log = buildFoodLog(f, mealType, user);
                    foodLogRepository.save(log);
                    foodCacheService.upsert(log);
                    result.add(log);
                }
            }
        }
        return result;
    }

    @SuppressWarnings("unchecked")
    public List<FoodLog> addFoodsFromPrompt(String prompt, String mealType, User user) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("prompt", prompt);
        if (mealType != null) requestBody.put("meal_type", mealType);
        requestBody.put("cached_foods", foodCacheService.getTopCachedFoods());

        Map<String, Object> aiResult = webClientBuilder.build()
                .post().uri(aiServiceUrl + "/extract-food-from-prompt")
                .header("X-Internal-Key", aiInternalSecret)
                .bodyValue(requestBody).retrieve()
                .bodyToMono(Map.class).block();

        if (aiResult == null) throw new RuntimeException("AI service returned no response");

        List<FoodLog> result = new ArrayList<>();
        for (var f : (List<Map<String, Object>>) aiResult.getOrDefault("food_logs", List.of())) {
            String resolvedMealType = mealType != null ? mealType : (String) f.getOrDefault("meal_type", "SNACK");
            var log = buildFoodLog(f, resolvedMealType, user);
            foodLogRepository.save(log);
            foodCacheService.upsert(log);
            result.add(log);
        }
        return result;
    }

    @SuppressWarnings("unchecked")
    private FoodLog buildFoodLog(Map<String, Object> f, String mealType, User user) {
        return FoodLog.builder()
                .user(user).logDate(LocalDate.now()).mealType(mealType)
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
    }

    @SuppressWarnings("unchecked")
    public WorkoutSession addWorkoutFromPrompt(String prompt, User user) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("prompt", prompt);

        Map<String, Object> aiResult = webClientBuilder.build()
                .post().uri(aiServiceUrl + "/extract-workout-from-prompt")
                .header("X-Internal-Key", aiInternalSecret)
                .bodyValue(requestBody).retrieve()
                .bodyToMono(Map.class).block();

        if (aiResult == null) throw new RuntimeException("AI service returned no response");

        Map<String, Object> w = (Map<String, Object>) aiResult.get("workout");
        if (w == null) throw new RuntimeException("No workout in AI response");

        String title = (String) w.getOrDefault("title", "Séance");
        if (title == null || title.isBlank()) title = "Séance";

        var session = WorkoutSession.builder()
                .user(user)
                .title(title)
                .durationMinutes(parseInteger(w.get("duration_minutes")))
                .caloriesBurned(parseInteger(w.get("calories_burned")))
                .notes((String) w.getOrDefault("notes", null))
                .build();

        var exercises = (List<Map<String, Object>>) w.getOrDefault("exercises", List.of());
        for (var ex : exercises) {
            String exName = (String) ex.getOrDefault("name", "Exercice");
            if (exName == null || exName.isBlank()) continue;
            session.getExercises().add(WorkoutExercise.builder()
                    .session(session)
                    .name(exName)
                    .sets(parseInteger(ex.get("sets")))
                    .reps(parseInteger(ex.get("reps")))
                    .weightKg(parseBigDecimal(ex.get("weight_kg")))
                    .durationSeconds(parseInteger(ex.get("duration_seconds")))
                    .build());
        }
        return workoutSessionRepository.save(session);
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

    private double scaleFactor(String quantity, String unit, Map<String, Double> portions) {
        if (quantity == null) return 1.0;
        double qty;
        try { qty = Double.parseDouble(quantity.trim()); }
        catch (Exception e) { return 1.0; }

        return switch (unit == null ? "" : unit) {
            case "g", "ml" -> qty / 100.0;
            case "oz" -> qty * 28.35 / 100.0;
            default -> {
                Double gw = portions == null ? null : portions.get(unit);
                yield gw != null ? (qty * gw) / 100.0 : -1.0;
            }
        };
    }

    private Map<String, Double> extractPortions(Map<String, Object> nutritionDetails) {
        if (nutritionDetails == null) return Map.of();
        Object rawPortions = nutritionDetails.get("portions");
        if (!(rawPortions instanceof Map<?, ?> rawMap)) return Map.of();

        Map<String, Double> portions = new HashMap<>();
        for (var entry : rawMap.entrySet()) {
            if (entry.getKey() == null || entry.getValue() == null) continue;
            if (entry.getValue() instanceof Number number) {
                portions.put(entry.getKey().toString(), number.doubleValue());
                continue;
            }
            try {
                portions.put(entry.getKey().toString(), Double.parseDouble(entry.getValue().toString()));
            } catch (Exception ignored) {
                // Ignore malformed cached portion values.
            }
        }
        return portions;
    }

    private Map<String, Object> foodWithUnit(Map<String, Object> food, String unit) {
        Map<String, Object> copy = new HashMap<>(food);
        copy.put("unit", unit);
        return copy;
    }

    private String normalizeKey(String value) {
        return value == null ? "" : value.trim().toLowerCase().replaceAll("\\s+", " ");
    }

    private BigDecimal nullToZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private boolean isWeightUnit(String unit) {
        return "g".equals(unit) || "ml".equals(unit) || "oz".equals(unit);
    }

    private boolean isSimpleIngredient(String name) {
        return name != null && name.trim().split("\\s+").length == 1;
    }

    private Double extractServingG(Map<String, Object> details) {
        if (details == null) return null;
        Object v = details.get("serving_g");
        if (v instanceof Number n) return n.doubleValue();
        if (v != null) try { return Double.parseDouble(v.toString()); } catch (Exception ignored) {}
        return null;
    }

    private double computeAiScale(String quantity, String unit, Double servingG) {
        if (quantity == null || quantity.isBlank() || servingG == null || servingG <= 0) return 1.0;
        double qty;
        try { qty = Double.parseDouble(quantity.trim()); } catch (Exception e) { return 1.0; }
        if (isWeightUnit(unit)) {
            double grams = "oz".equals(unit) ? qty * 28.35 : qty;
            return grams / servingG;
        }
        return qty; // piece/bowl/cup/etc → quantity = nb de portions
    }

    private BigDecimal scaleBD(BigDecimal v, double factor) {
        return v == null ? null : BigDecimal.valueOf(v.doubleValue() * factor);
    }

    private Integer scaleCalories(Number value, double scale) {
        return value == null ? null : (int) Math.round(value.doubleValue() * scale);
    }

    private BigDecimal scaleBigDecimal(BigDecimal value, double scale) {
        return value == null ? null : BigDecimal.valueOf(value.doubleValue() * scale);
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

    private String normalizeMood(String mood) {
        if (mood == null || mood.isBlank()) return null;
        return switch (mood.trim().toUpperCase()) {
            case "GREAT" -> "great";
            case "GOOD" -> "good";
            case "NEUTRAL" -> "neutral";
            case "BAD" -> "bad";
            case "TERRIBLE", "AWFUL" -> "awful";
            default -> mood.trim().toLowerCase();
        };
    }

    private String[] parseStringArray(Object value) {
        if (value instanceof List<?> list) {
            return list.stream()
                    .filter(Objects::nonNull)
                    .map(Object::toString)
                    .filter(tag -> !tag.isBlank())
                    .toArray(String[]::new);
        }
        return null;
    }
}
