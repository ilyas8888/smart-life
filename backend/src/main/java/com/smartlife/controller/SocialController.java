package com.smartlife.controller;

import com.smartlife.model.*;
import com.smartlife.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/social")
@RequiredArgsConstructor
public class SocialController {

    private static final Set<String> VALID_TYPES = Set.of(
            "FOOD_LOG", "WORKOUT_PLAN", "SLEEP_LOG", "STUDY_SESSION", "NOTE", "JOURNAL");
    private static final Set<String> VALID_REACTIONS = Set.of("INSPIRED", "TRYING", "BRAVO", "HOW");
    private static final int PAGE_SIZE = 20;

    private final SocialPostRepository     postRepo;
    private final SocialReactionRepository reactionRepo;
    private final SocialCommentRepository  commentRepo;
    private final SocialSaveRepository     saveRepo;
    private final FoodLogRepository        foodLogRepo;
    private final WorkoutPlanRepository    workoutPlanRepo;
    private final SleepLogRepository       sleepLogRepo;
    private final StudySessionRepository   studySessionRepo;
    private final NoteRepository           noteRepo;
    private final DiaryEntryRepository     diaryRepo;

    // ─── Feed ───────────────────────────────────────────────────────────────

    @GetMapping("/posts")
    public List<Map<String, Object>> getFeed(
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "0") int page) {
        User user = currentUser();
        PageRequest pageable = PageRequest.of(page, PAGE_SIZE);
        List<SocialPost> posts = (type != null && VALID_TYPES.contains(type))
                ? postRepo.findByResourceTypeAndVisibilityOrderByCreatedAtDesc(type, "PUBLIC", pageable)
                : postRepo.findByVisibilityOrderByCreatedAtDesc("PUBLIC", pageable);
        return posts.stream().map(p -> toFeedItem(p, user.getId())).toList();
    }

    @GetMapping("/saved")
    public List<Map<String, Object>> getSaved() {
        User user = currentUser();
        return saveRepo.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(save -> postRepo.findById(save.getPostId()).orElse(null))
                .filter(Objects::nonNull)
                .map(p -> toFeedItem(p, user.getId()))
                .toList();
    }

    // ─── Create / Delete Post ────────────────────────────────────────────────

    @PostMapping("/posts")
    public ResponseEntity<?> createPost(@RequestBody Map<String, Object> body) {
        User user = currentUser();
        String resourceType = asString(body.get("resourceType"));
        Long resourceId = asLong(body.get("resourceId"));

        if (resourceType == null || !VALID_TYPES.contains(resourceType) || resourceId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "INVALID_POST"));
        }
        if (!resourceBelongsToUser(resourceType, resourceId, user.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "RESOURCE_NOT_YOURS"));
        }

        SocialPost post = SocialPost.builder()
                .author(user)
                .resourceType(resourceType)
                .resourceId(resourceId)
                .title(asString(body.get("title")))
                .caption(asString(body.get("caption")))
                .visibility("PUBLIC")
                .build();

        SocialPost saved = postRepo.save(post);
        return ResponseEntity.status(HttpStatus.CREATED).body(toFeedItem(saved, user.getId()));
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        User user = currentUser();
        return postRepo.findById(id)
                .filter(p -> p.getAuthor().getId().equals(user.getId()))
                .map(p -> {
                    postRepo.delete(p);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ─── Reactions ───────────────────────────────────────────────────────────

    @PostMapping("/posts/{id}/react")
    public ResponseEntity<?> react(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        User user = currentUser();
        String type = asString(body.get("type"));
        if (type == null || !VALID_REACTIONS.contains(type)) {
            return ResponseEntity.badRequest().body(Map.of("error", "INVALID_REACTION"));
        }
        Optional<SocialPost> postOpt = postRepo.findById(id);
        if (postOpt.isEmpty()) return ResponseEntity.notFound().build();
        SocialPost post = postOpt.get();

        Optional<SocialReaction> existing = reactionRepo.findByPostIdAndUserId(id, user.getId());
        if (existing.isPresent()) {
            if (existing.get().getReactionType().equals(type)) {
                reactionRepo.delete(existing.get());
                post.setReactionsCount(Math.max(0, post.getReactionsCount() - 1));
                postRepo.save(post);
                return ResponseEntity.ok(Map.of("removed", true, "type", type));
            }
            existing.get().setReactionType(type);
            reactionRepo.save(existing.get());
        } else {
            reactionRepo.save(SocialReaction.builder()
                    .postId(id).userId(user.getId()).reactionType(type).build());
            post.setReactionsCount(post.getReactionsCount() + 1);
            postRepo.save(post);
        }
        return ResponseEntity.ok(Map.of("removed", false, "type", type));
    }

    // ─── Comments ────────────────────────────────────────────────────────────

    @GetMapping("/posts/{id}/comments")
    public ResponseEntity<?> getComments(@PathVariable Long id) {
        if (!postRepo.existsById(id)) return ResponseEntity.notFound().build();
        List<SocialComment> roots = commentRepo.findByPostIdAndParentIdIsNullOrderByCreatedAtAsc(id);
        List<Map<String, Object>> result = roots.stream().map(c -> {
            Map<String, Object> cm = toCommentMap(c);
            List<Map<String, Object>> replies = commentRepo
                    .findByParentIdOrderByCreatedAtAsc(c.getId())
                    .stream().map(this::toCommentMap).toList();
            cm.put("replies", replies);
            return cm;
        }).toList();
        return ResponseEntity.ok(result);
    }

    @PostMapping("/posts/{id}/comments")
    public ResponseEntity<?> addComment(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        User user = currentUser();
        Optional<SocialPost> postOpt = postRepo.findById(id);
        if (postOpt.isEmpty()) return ResponseEntity.notFound().build();

        String content = asString(body.get("content"));
        if (content == null || content.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "EMPTY_CONTENT"));
        }
        Long parentId = asLong(body.get("parentId"));

        SocialComment comment = SocialComment.builder()
                .postId(id)
                .author(user)
                .parentId(parentId)
                .content(content.trim())
                .build();
        SocialComment saved = commentRepo.save(comment);

        SocialPost post = postOpt.get();
        post.setCommentsCount(post.getCommentsCount() + 1);
        postRepo.save(post);

        return ResponseEntity.status(HttpStatus.CREATED).body(toCommentMap(saved));
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        User user = currentUser();
        return commentRepo.findById(id)
                .filter(c -> c.getAuthor().getId().equals(user.getId()))
                .map(c -> {
                    postRepo.findById(c.getPostId()).ifPresent(post -> {
                        post.setCommentsCount(Math.max(0, post.getCommentsCount() - 1));
                        postRepo.save(post);
                    });
                    commentRepo.delete(c);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ─── Saves ───────────────────────────────────────────────────────────────

    @PostMapping("/posts/{id}/save")
    public ResponseEntity<?> toggleSave(@PathVariable Long id) {
        User user = currentUser();
        Optional<SocialPost> postOpt = postRepo.findById(id);
        if (postOpt.isEmpty()) return ResponseEntity.notFound().build();
        SocialPost post = postOpt.get();

        Optional<SocialSave> existing = saveRepo.findByPostIdAndUserId(id, user.getId());
        if (existing.isPresent()) {
            saveRepo.delete(existing.get());
            post.setSavesCount(Math.max(0, post.getSavesCount() - 1));
            postRepo.save(post);
            return ResponseEntity.ok(Map.of("saved", false));
        }
        saveRepo.save(SocialSave.builder().postId(id).userId(user.getId()).build());
        post.setSavesCount(post.getSavesCount() + 1);
        postRepo.save(post);
        return ResponseEntity.ok(Map.of("saved", true));
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private Map<String, Object> toFeedItem(SocialPost post, Long currentUserId) {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("id", post.getId());
        r.put("author", authorMap(post.getAuthor()));
        r.put("resourceType", post.getResourceType());
        r.put("resourceId", post.getResourceId());
        r.put("title", post.getTitle());
        r.put("caption", post.getCaption());
        r.put("preview", loadPreview(post));
        r.put("reactions", reactionSummary(post.getId()));
        r.put("myReaction", myReaction(post.getId(), currentUserId));
        r.put("commentsCount", post.getCommentsCount());
        r.put("savesCount", post.getSavesCount());
        r.put("reactionsCount", post.getReactionsCount());
        r.put("isSaved", saveRepo.findByPostIdAndUserId(post.getId(), currentUserId).isPresent());
        r.put("createdAt", post.getCreatedAt());
        r.put("timeAgo", timeAgo(post.getCreatedAt()));
        return r;
    }

    private Map<String, Object> authorMap(User user) {
        String name = (user.getFirstName() != null && !user.getFirstName().isBlank())
                ? user.getFirstName()
                : user.getEmail().split("@")[0];
        String initials = name.length() >= 2 ? name.substring(0, 2).toUpperCase() : name.toUpperCase();
        return Map.of(
                "name",        name,
                "initials",    initials,
                "username",    user.getHandle() != null ? user.getHandle() : "",
                "avatarColor", user.getAvatarColor() != null ? user.getAvatarColor() : "#6366F1"
        );
    }

    private Map<String, Object> reactionSummary(Long postId) {
        Map<String, Long> counts = reactionRepo.findByPostId(postId).stream()
                .collect(Collectors.groupingBy(SocialReaction::getReactionType, Collectors.counting()));
        Map<String, Object> summary = new LinkedHashMap<>();
        for (String type : VALID_REACTIONS) summary.put(type, counts.getOrDefault(type, 0L));
        return summary;
    }

    private String myReaction(Long postId, Long userId) {
        return reactionRepo.findByPostIdAndUserId(postId, userId)
                .map(SocialReaction::getReactionType).orElse(null);
    }

    private Map<String, Object> loadPreview(SocialPost post) {
        Map<String, Object> p = new LinkedHashMap<>();
        try {
            switch (post.getResourceType()) {
                case "NOTE" -> noteRepo.findById(post.getResourceId()).ifPresent(n -> {
                    p.put("title", n.getTitle());
                    p.put("excerpt", excerpt(n.getContent(), 120));
                    p.put("tags", n.getTags());
                });
                case "JOURNAL" -> diaryRepo.findById(post.getResourceId()).ifPresent(d -> {
                    p.put("entryDate", d.getEntryDate());
                    p.put("excerpt", excerpt(d.getContent(), 120));
                    p.put("mood", d.getMood());
                });
                case "FOOD_LOG" -> foodLogRepo.findById(post.getResourceId()).ifPresent(f -> {
                    p.put("logDate", f.getLogDate());
                    p.put("foodItem", f.getFoodItem());
                    p.put("mealType", f.getMealType());
                    p.put("calories", f.getCalories());
                    p.put("quantity", f.getQuantity());
                });
                case "WORKOUT_PLAN" -> workoutPlanRepo.findById(post.getResourceId()).ifPresent(w -> {
                    p.put("name", w.getName());
                    p.put("goal", w.getGoal());
                    p.put("weeks", w.getWeeks());
                    p.put("daysPerWeek", w.getDaysPerWeek());
                    p.put("daysCount", w.getDays().size());
                });
                case "SLEEP_LOG" -> sleepLogRepo.findById(post.getResourceId()).ifPresent(s -> {
                    long mins = ChronoUnit.MINUTES.between(s.getBedtime(), s.getWakeTime());
                    p.put("sleepDate", s.getSleepDate());
                    p.put("durationMinutes", mins);
                    p.put("quality", s.getQuality());
                });
                case "STUDY_SESSION" -> studySessionRepo.findById(post.getResourceId()).ifPresent(ss -> {
                    p.put("title", ss.getTitle());
                    p.put("topic", ss.getTopic() != null ? ss.getTopic().getName() : null);
                    p.put("durationMinutes", ss.getDurationMinutes());
                    p.put("focusScore", ss.getFocusScore());
                });
            }
        } catch (Exception ignored) {}
        return p;
    }

    private boolean resourceBelongsToUser(String resourceType, Long resourceId, Long userId) {
        return switch (resourceType) {
            case "NOTE" -> noteRepo.findById(resourceId)
                    .map(n -> n.getUser().getId().equals(userId)).orElse(false);
            case "JOURNAL" -> diaryRepo.findById(resourceId)
                    .map(d -> d.getUser().getId().equals(userId)).orElse(false);
            case "FOOD_LOG" -> foodLogRepo.findById(resourceId)
                    .map(f -> f.getUser().getId().equals(userId)).orElse(false);
            case "WORKOUT_PLAN" -> workoutPlanRepo.findById(resourceId)
                    .map(w -> w.getUser().getId().equals(userId)).orElse(false);
            case "SLEEP_LOG" -> sleepLogRepo.findById(resourceId)
                    .map(s -> s.getUser().getId().equals(userId)).orElse(false);
            case "STUDY_SESSION" -> studySessionRepo.findById(resourceId)
                    .map(ss -> ss.getUser().getId().equals(userId)).orElse(false);
            default -> false;
        };
    }

    private Map<String, Object> toCommentMap(SocialComment c) {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("id", c.getId());
        r.put("postId", c.getPostId());
        r.put("parentId", c.getParentId());
        r.put("author", authorMap(c.getAuthor()));
        r.put("content", c.getContent());
        r.put("createdAt", c.getCreatedAt());
        r.put("timeAgo", timeAgo(c.getCreatedAt()));
        return r;
    }

    private String excerpt(String text, int maxLen) {
        if (text == null) return null;
        return text.length() <= maxLen ? text : text.substring(0, maxLen) + "…";
    }

    private String timeAgo(LocalDateTime dt) {
        if (dt == null) return "";
        long mins = ChronoUnit.MINUTES.between(dt, LocalDateTime.now());
        if (mins < 1)   return "à l'instant";
        if (mins < 60)  return mins + " min";
        long hrs = mins / 60;
        if (hrs < 24)   return hrs + "h";
        long days = hrs / 24;
        if (days < 7)   return days + "j";
        return dt.toLocalDate().toString();
    }

    private User currentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private String asString(Object v) {
        return v instanceof String s && !s.isBlank() ? s.trim() : null;
    }

    private Long asLong(Object v) {
        if (v instanceof Number n) return n.longValue();
        if (v instanceof String s) { try { return Long.parseLong(s); } catch (Exception e) { return null; } }
        return null;
    }
}
