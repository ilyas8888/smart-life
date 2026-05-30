package com.smartlife.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartlife.model.*;
import com.smartlife.repository.*;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequiredArgsConstructor
public class SharedLinkController {

    private static final Set<String> RESOURCE_TYPES = Set.of("FOOD_LOG", "WORKOUT_PLAN", "SLEEP_LOG", "STUDY_SESSION", "NOTE", "JOURNAL");
    private static final Bandwidth PUBLIC_SHARE_LIMIT = Bandwidth.classic(60, Refill.intervally(60, Duration.ofMinutes(1)));

    private static final Set<String> CLONEABLE_TYPES = Set.of("NOTE", "JOURNAL", "FOOD_LOG", "WORKOUT_PLAN");

    private final SharedLinkRepository sharedLinkRepository;
    private final FoodLogRepository foodLogRepository;
    private final WorkoutPlanRepository workoutPlanRepository;
    private final SleepLogRepository sleepLogRepository;
    private final StudySessionRepository studySessionRepository;
    private final NoteRepository noteRepository;
    private final DiaryEntryRepository diaryEntryRepository;
    private final ObjectMapper objectMapper;
    private final ConcurrentHashMap<String, Bucket> publicShareBuckets = new ConcurrentHashMap<>();

    @PostMapping("/api/shares")
    public ResponseEntity<?> createShare(@RequestBody Map<String, Object> body) {
        User user = currentUser();
        String resourceType = asString(body.get("resourceType"));
        Long resourceId = asLong(body.get("resourceId"));

        if (!isValidResourceType(resourceType) || resourceId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "INVALID_SHARE_RESOURCE"));
        }
        if (!resourceBelongsToUser(resourceType, resourceId, user.getId())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "RESOURCE_NOT_FOUND"));
        }

        Map<String, Object> permissions = new LinkedHashMap<>();
        permissions.put("allowComments", asBoolean(body.get("allowComments")));
        permissions.put("allowReactions", asBoolean(body.get("allowReactions")));

        String recipientEmail = asString(body.get("recipientEmail"));

        SharedLink link = SharedLink.builder()
                .owner(user)
                .resourceType(resourceType)
                .resourceId(resourceId)
                .token(UUID.randomUUID())
                .title(asString(body.get("title")))
                .permissions(writePermissions(permissions))
                .maskCalories(asBoolean(body.get("maskCalories")))
                .expiresAt(resolveExpiresAt(asString(body.get("expiresIn"))))
                .revoked(false)
                .viewCount(0)
                .clonesCount(0)
                .recipientEmail(recipientEmail)
                .build();

        SharedLink saved = sharedLinkRepository.save(link);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id", saved.getId(),
                "token", saved.getToken().toString(),
                "url", shareUrl(saved),
                "expiresAt", saved.getExpiresAt(),
                "createdAt", saved.getCreatedAt()
        ));
    }

    @GetMapping("/api/shares")
    public List<Map<String, Object>> getShares() {
        User user = currentUser();
        return sharedLinkRepository.findByOwnerIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toListResponse)
                .toList();
    }

    @DeleteMapping("/api/shares/{id}")
    public ResponseEntity<Void> deleteShare(@PathVariable Long id) {
        User user = currentUser();
        return sharedLinkRepository.findById(id)
                .filter(link -> link.getOwner().getId().equals(user.getId()))
                .map(link -> {
                    sharedLinkRepository.delete(link);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/api/shares/{id}/revoke")
    public ResponseEntity<?> revokeShare(@PathVariable Long id) {
        User user = currentUser();
        Optional<SharedLink> found = sharedLinkRepository.findById(id);
        if (found.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        SharedLink link = found.get();
        if (!link.getOwner().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        link.setRevoked(true);
        return ResponseEntity.ok(toListResponse(sharedLinkRepository.save(link)));
    }

    @GetMapping("/api/shares/received")
    public List<Map<String, Object>> getReceivedShares() {
        User user = currentUser();
        return sharedLinkRepository
                .findByRecipientEmailAndRevokedFalseOrderByCreatedAtDesc(user.getEmail())
                .stream()
                .filter(link -> !isExpired(link))
                .map(this::toReceivedResponse)
                .toList();
    }

    @PostMapping("/api/shares/{token}/clone")
    public ResponseEntity<?> cloneShare(@PathVariable UUID token) {
        User user = currentUser();
        Optional<SharedLink> found = sharedLinkRepository.findByToken(token);
        if (found.isEmpty()) return ResponseEntity.notFound().build();

        SharedLink link = found.get();
        if (Boolean.TRUE.equals(link.getRevoked())) {
            return ResponseEntity.status(HttpStatus.GONE).body(Map.of("error", "LINK_REVOKED"));
        }
        if (isExpired(link)) {
            return ResponseEntity.status(HttpStatus.GONE).body(Map.of("error", "LINK_EXPIRED"));
        }
        if (!CLONEABLE_TYPES.contains(link.getResourceType())) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                    .body(Map.of("error", "NOT_CLONEABLE"));
        }

        Long clonedId = cloneResource(link.getResourceType(), link.getResourceId(), user);
        if (clonedId == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "RESOURCE_NOT_FOUND"));
        }

        link.setClonesCount((link.getClonesCount() != null ? link.getClonesCount() : 0) + 1);
        sharedLinkRepository.save(link);

        return ResponseEntity.ok(Map.of(
                "clonedResourceId", clonedId,
                "resourceType", link.getResourceType(),
                "message", "Ressource clonée dans votre compte"
        ));
    }

    @GetMapping("/api/public/shares/{token}")
    public ResponseEntity<?> getPublicShare(@PathVariable UUID token, HttpServletRequest request) {
        if (!bucketForClient(request).tryConsume(1)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(Map.of("error", "RATE_LIMIT_EXCEEDED"));
        }

        Optional<SharedLink> found = sharedLinkRepository.findByToken(token);
        if (found.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        SharedLink link = found.get();
        if (Boolean.TRUE.equals(link.getRevoked())) {
            return ResponseEntity.status(HttpStatus.GONE).body(Map.of("error", "LINK_REVOKED"));
        }
        if (isExpired(link)) {
            return ResponseEntity.status(HttpStatus.GONE).body(Map.of("error", "LINK_EXPIRED"));
        }

        Map<String, Object> resource = loadResource(link);
        if (resource == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "RESOURCE_NOT_FOUND"));
        }

        link.setViewCount((link.getViewCount() != null ? link.getViewCount() : 0) + 1);
        SharedLink saved = sharedLinkRepository.save(link);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("linkId", saved.getId());
        response.put("title", saved.getTitle());
        response.put("resourceType", saved.getResourceType());
        response.put("resourceId", saved.getResourceId());
        response.put("viewCount", saved.getViewCount());
        response.put("owner", Map.of("username", ownerName(saved.getOwner())));
        response.put("permissions", readPermissions(saved.getPermissions()));
        response.put("maskCalories", Boolean.TRUE.equals(saved.getMaskCalories()));
        response.put("resource", resource);
        response.put("createdAt", saved.getCreatedAt());
        return ResponseEntity.ok(response);
    }

    private Map<String, Object> toListResponse(SharedLink link) {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("id", link.getId());
        r.put("resourceType", link.getResourceType());
        r.put("resourceId", link.getResourceId());
        r.put("title", link.getTitle());
        r.put("token", link.getToken().toString());
        r.put("url", shareUrl(link));
        r.put("expiresAt", link.getExpiresAt());
        r.put("revoked", Boolean.TRUE.equals(link.getRevoked()));
        r.put("viewCount", link.getViewCount() != null ? link.getViewCount() : 0);
        r.put("clonesCount", link.getClonesCount() != null ? link.getClonesCount() : 0);
        r.put("recipientEmail", link.getRecipientEmail());
        r.put("createdAt", link.getCreatedAt());
        r.put("isExpired", isExpired(link));
        return r;
    }

    private Map<String, Object> toReceivedResponse(SharedLink link) {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("id", link.getId());
        r.put("resourceType", link.getResourceType());
        r.put("resourceId", link.getResourceId());
        r.put("title", link.getTitle());
        r.put("token", link.getToken().toString());
        r.put("url", shareUrl(link));
        r.put("expiresAt", link.getExpiresAt());
        r.put("viewCount", link.getViewCount() != null ? link.getViewCount() : 0);
        r.put("clonesCount", link.getClonesCount() != null ? link.getClonesCount() : 0);
        r.put("owner", Map.of("username", ownerName(link.getOwner())));
        r.put("isCloneable", CLONEABLE_TYPES.contains(link.getResourceType()));
        r.put("createdAt", link.getCreatedAt());
        return r;
    }

    private Long cloneResource(String resourceType, Long resourceId, User user) {
        return switch (resourceType) {
            case "NOTE" -> noteRepository.findById(resourceId).map(src -> {
                Note clone = Note.builder()
                        .user(user)
                        .title(src.getTitle() != null ? src.getTitle() + " (cloné)" : "Note clonée")
                        .content(src.getContent())
                        .tags(src.getTags())
                        .isPinned(false)
                        .color(src.getColor())
                        .build();
                return noteRepository.save(clone).getId();
            }).orElse(null);

            case "JOURNAL" -> diaryEntryRepository.findById(resourceId).map(src -> {
                DiaryEntry clone = DiaryEntry.builder()
                        .user(user)
                        .entryDate(LocalDate.now())
                        .content(src.getContent())
                        .mood(src.getMood())
                        .tags(src.getTags())
                        .build();
                return diaryEntryRepository.save(clone).getId();
            }).orElse(null);

            case "FOOD_LOG" -> foodLogRepository.findById(resourceId).map(src -> {
                FoodLog clone = FoodLog.builder()
                        .user(user)
                        .logDate(LocalDate.now())
                        .mealType(src.getMealType())
                        .foodItem(src.getFoodItem())
                        .calories(src.getCalories())
                        .proteinG(src.getProteinG())
                        .carbsG(src.getCarbsG())
                        .fatG(src.getFatG())
                        .fiberG(src.getFiberG())
                        .quantity(src.getQuantity())
                        .nutritionDetails(src.getNutritionDetails())
                        .notes(src.getNotes())
                        .build();
                return foodLogRepository.save(clone).getId();
            }).orElse(null);

            case "WORKOUT_PLAN" -> workoutPlanRepository.findById(resourceId).map(src -> {
                WorkoutPlan clone = WorkoutPlan.builder()
                        .user(user)
                        .name(src.getName() + " (cloné)")
                        .goal(src.getGoal())
                        .weeks(src.getWeeks())
                        .daysPerWeek(src.getDaysPerWeek())
                        .status("ACTIVE")
                        .startDate(LocalDate.now())
                        .build();
                WorkoutPlan saved = workoutPlanRepository.save(clone);
                src.getDays().forEach(srcDay -> {
                    PlanDay cloneDay = new PlanDay();
                    cloneDay.setPlan(saved);
                    cloneDay.setDayNumber(srcDay.getDayNumber());
                    cloneDay.setLabel(srcDay.getLabel());
                    cloneDay.setExercises(new ArrayList<>(srcDay.getExercises()));
                    saved.getDays().add(cloneDay);
                });
                return workoutPlanRepository.save(saved).getId();
            }).orElse(null);

            default -> null;
        };
    }

    private boolean resourceBelongsToUser(String resourceType, Long resourceId, Long userId) {
        return switch (resourceType) {
            case "FOOD_LOG" -> foodLogRepository.findById(resourceId)
                    .map(log -> log.getUser().getId().equals(userId)).orElse(false);
            case "WORKOUT_PLAN" -> workoutPlanRepository.findById(resourceId)
                    .map(plan -> plan.getUser().getId().equals(userId)).orElse(false);
            case "SLEEP_LOG" -> sleepLogRepository.findById(resourceId)
                    .map(log -> log.getUser().getId().equals(userId)).orElse(false);
            case "STUDY_SESSION" -> studySessionRepository.findById(resourceId)
                    .map(session -> session.getUser().getId().equals(userId)).orElse(false);
            case "NOTE" -> noteRepository.findById(resourceId)
                    .map(note -> note.getUser().getId().equals(userId)).orElse(false);
            case "JOURNAL" -> diaryEntryRepository.findById(resourceId)
                    .map(entry -> entry.getUser().getId().equals(userId)).orElse(false);
            default -> false;
        };
    }

    private Map<String, Object> loadResource(SharedLink link) {
        return switch (link.getResourceType()) {
            case "FOOD_LOG" -> foodLogRepository.findById(link.getResourceId())
                    .map(log -> toFoodLogResource(log, Boolean.TRUE.equals(link.getMaskCalories()))).orElse(null);
            case "WORKOUT_PLAN" -> workoutPlanRepository.findById(link.getResourceId())
                    .map(this::toWorkoutPlanResource).orElse(null);
            case "SLEEP_LOG" -> sleepLogRepository.findById(link.getResourceId())
                    .map(this::toSleepLogResource).orElse(null);
            case "STUDY_SESSION" -> studySessionRepository.findById(link.getResourceId())
                    .map(this::toStudySessionResource).orElse(null);
            case "NOTE" -> noteRepository.findById(link.getResourceId())
                    .map(this::toNoteResource).orElse(null);
            case "JOURNAL" -> diaryEntryRepository.findById(link.getResourceId())
                    .map(this::toJournalResource).orElse(null);
            default -> null;
        };
    }

    private Map<String, Object> toFoodLogResource(FoodLog log, boolean maskCalories) {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("id", log.getId());
        r.put("logDate", log.getLogDate());
        r.put("mealType", log.getMealType());
        r.put("foodItem", log.getFoodItem());
        r.put("calories", maskCalories ? null : log.getCalories());
        r.put("proteinG", maskCalories ? null : log.getProteinG());
        r.put("carbsG", maskCalories ? null : log.getCarbsG());
        r.put("fatG", maskCalories ? null : log.getFatG());
        r.put("fiberG", maskCalories ? null : log.getFiberG());
        r.put("quantity", log.getQuantity());
        r.put("nutritionDetails", log.getNutritionDetails());
        r.put("notes", log.getNotes());
        r.put("loggedAt", log.getLoggedAt());
        return r;
    }

    private Map<String, Object> toWorkoutPlanResource(WorkoutPlan plan) {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("id", plan.getId());
        r.put("name", plan.getName());
        r.put("goal", plan.getGoal());
        r.put("weeks", plan.getWeeks());
        r.put("daysPerWeek", plan.getDaysPerWeek());
        r.put("status", plan.getStatus());
        r.put("startDate", plan.getStartDate());
        r.put("createdAt", plan.getCreatedAt());
        r.put("days", plan.getDays().stream().map(day -> {
            Map<String, Object> d = new LinkedHashMap<>();
            d.put("id", day.getId());
            d.put("dayNumber", day.getDayNumber());
            d.put("label", day.getLabel());
            d.put("exercises", day.getExercises());
            return d;
        }).toList());
        return r;
    }

    private Map<String, Object> toSleepLogResource(SleepLog log) {
        long durationMinutes = ChronoUnit.MINUTES.between(log.getBedtime(), log.getWakeTime());
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("id", log.getId());
        r.put("sleepDate", log.getSleepDate());
        r.put("bedtime", log.getBedtime());
        r.put("wakeTime", log.getWakeTime());
        r.put("durationMinutes", durationMinutes);
        r.put("quality", log.getQuality());
        r.put("energy", log.getEnergy());
        r.put("wakeUps", log.getWakeUps());
        r.put("factors", log.getFactors());
        r.put("notes", log.getNotes());
        r.put("createdAt", log.getCreatedAt());
        return r;
    }

    private Map<String, Object> toStudySessionResource(StudySession session) {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("id", session.getId());
        r.put("title", session.getTitle());
        r.put("topic", session.getTopic() != null ? session.getTopic().getName() : null);
        r.put("startedAt", session.getStartedAt());
        r.put("endedAt", session.getEndedAt());
        r.put("durationMinutes", session.getDurationMinutes());
        r.put("focusScore", session.getFocusScore());
        r.put("difficultyScore", session.getDifficultyScore());
        r.put("notes", session.getNotes());
        r.put("learned", session.getLearned());
        r.put("nextStep", session.getNextStep());
        r.put("createdAt", session.getCreatedAt());
        return r;
    }

    private Map<String, Object> toNoteResource(Note note) {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("id", note.getId());
        r.put("title", note.getTitle());
        r.put("content", note.getContent());
        r.put("tags", note.getTags());
        r.put("isPinned", note.isPinned());
        r.put("color", note.getColor());
        r.put("createdAt", note.getCreatedAt());
        r.put("updatedAt", note.getUpdatedAt());
        return r;
    }

    private Map<String, Object> toJournalResource(DiaryEntry entry) {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("id", entry.getId());
        r.put("entryDate", entry.getEntryDate());
        r.put("content", entry.getContent());
        r.put("mood", entry.getMood());
        r.put("tags", entry.getTags());
        r.put("createdAt", entry.getCreatedAt());
        r.put("updatedAt", entry.getUpdatedAt());
        return r;
    }

    private LocalDateTime resolveExpiresAt(String expiresIn) {
        String value = expiresIn != null ? expiresIn : "NEVER";
        LocalDateTime now = LocalDateTime.now();
        return switch (value) {
            case "24H" -> now.plusHours(24);
            case "7D" -> now.plusDays(7);
            case "30D" -> now.plusDays(30);
            case "NEVER" -> null;
            default -> null;
        };
    }

    private boolean isExpired(SharedLink link) {
        return link.getExpiresAt() != null && link.getExpiresAt().isBefore(LocalDateTime.now());
    }

    private boolean isValidResourceType(String resourceType) {
        return resourceType != null && RESOURCE_TYPES.contains(resourceType);
    }

    private String shareUrl(SharedLink link) {
        return "/share/" + link.getToken();
    }

    private String writePermissions(Map<String, Object> permissions) {
        try {
            return objectMapper.writeValueAsString(permissions);
        } catch (Exception e) {
            return "{\"allowComments\":false,\"allowReactions\":false}";
        }
    }

    private Map<String, Object> readPermissions(String permissions) {
        if (permissions == null || permissions.isBlank()) {
            return Map.of("allowComments", false, "allowReactions", false);
        }
        try {
            return objectMapper.readValue(permissions, new TypeReference<>() {});
        } catch (Exception e) {
            return Map.of("allowComments", false, "allowReactions", false);
        }
    }

    private String ownerName(User owner) {
        if (owner.getFirstName() != null && !owner.getFirstName().isBlank()) {
            return owner.getFirstName();
        }
        return anonymizeEmail(owner.getEmail());
    }

    private String anonymizeEmail(String email) {
        if (email == null || !email.contains("@")) return "Utilisateur SmartLife";
        String[] parts = email.split("@", 2);
        String name = parts[0];
        String visible = name.length() <= 2 ? name.substring(0, 1) : name.substring(0, 2);
        return visible + "***@" + parts[1];
    }

    private String asString(Object value) {
        return value instanceof String s && !s.isBlank() ? s.trim() : null;
    }

    private Long asLong(Object value) {
        if (value instanceof Number n) return n.longValue();
        if (value instanceof String s && !s.isBlank()) {
            try {
                return Long.parseLong(s);
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }

    private boolean asBoolean(Object value) {
        return value instanceof Boolean b && b;
    }

    private Bucket bucketForClient(HttpServletRequest request) {
        return publicShareBuckets.computeIfAbsent(clientIp(request), ignored -> Bucket.builder()
                .addLimit(PUBLIC_SHARE_LIMIT)
                .build());
    }

    private String clientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private User currentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
