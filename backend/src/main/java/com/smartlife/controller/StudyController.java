package com.smartlife.controller;

import com.smartlife.model.StudyReview;
import com.smartlife.model.StudySession;
import com.smartlife.model.StudyTopic;
import com.smartlife.model.User;
import com.smartlife.repository.StudyReviewRepository;
import com.smartlife.repository.StudySessionRepository;
import com.smartlife.repository.StudyTopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/study")
@RequiredArgsConstructor
public class StudyController {

    private final StudyTopicRepository studyTopicRepository;
    private final StudySessionRepository studySessionRepository;
    private final StudyReviewRepository studyReviewRepository;

    @GetMapping("/topics")
    public List<Map<String, Object>> getTopics(@AuthenticationPrincipal User user) {
        return studyTopicRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::topicResponse)
                .toList();
    }

    @PostMapping("/topics")
    public ResponseEntity<?> createTopic(@RequestBody Map<String, Object> body,
                                         @AuthenticationPrincipal User user) {
        String name = text(body.get("name"));
        if (name == null) return ResponseEntity.badRequest().body(Map.of("error", "INVALID_TOPIC"));

        StudyTopic topic = StudyTopic.builder()
                .user(user)
                .name(name)
                .color(textOrDefault(body.get("color"), "blue"))
                .goal(text(body.get("goal")))
                .targetHours(intValue(body.get("targetHours")))
                .deadline(dateValue(body.get("deadline")))
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(topicResponse(studyTopicRepository.save(topic)));
    }

    @PutMapping("/topics/{id}")
    public ResponseEntity<?> updateTopic(@PathVariable Long id,
                                         @RequestBody Map<String, Object> body,
                                         @AuthenticationPrincipal User user) {
        return studyTopicRepository.findById(id)
                .map(topic -> {
                    if (!topic.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                    }
                    String name = text(body.get("name"));
                    if (name == null) return ResponseEntity.badRequest().body(Map.of("error", "INVALID_TOPIC"));
                    topic.setName(name);
                    topic.setColor(textOrDefault(body.get("color"), "blue"));
                    topic.setGoal(text(body.get("goal")));
                    topic.setTargetHours(intValue(body.get("targetHours")));
                    topic.setDeadline(dateValue(body.get("deadline")));
                    return ResponseEntity.ok(topicResponse(studyTopicRepository.save(topic)));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/topics/{id}")
    public ResponseEntity<Void> deleteTopic(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return studyTopicRepository.findById(id)
                .filter(topic -> topic.getUser().getId().equals(user.getId()))
                .map(topic -> {
                    studyTopicRepository.delete(topic);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/sessions")
    public List<Map<String, Object>> getSessions(@AuthenticationPrincipal User user) {
        return studySessionRepository.findByUserIdOrderByStartedAtDesc(user.getId()).stream()
                .map(this::sessionResponse)
                .toList();
    }

    @PostMapping("/sessions/start")
    public ResponseEntity<?> startSession(@RequestBody Map<String, Object> body,
                                          @AuthenticationPrincipal User user) {
        String title = text(body.get("title"));
        if (title == null) return ResponseEntity.badRequest().body(Map.of("error", "INVALID_SESSION"));

        StudyTopic topic = null;
        Long topicId = longValue(body.get("topicId"));
        if (topicId != null) {
            var topicResult = studyTopicRepository.findById(topicId)
                    .filter(t -> t.getUser().getId().equals(user.getId()));
            if (topicResult.isEmpty()) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            topic = topicResult.get();
        }

        StudySession session = StudySession.builder()
                .user(user)
                .topic(topic)
                .title(title)
                .startedAt(dateTimeOrNow(body.get("startedAt")))
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(sessionResponse(studySessionRepository.save(session)));
    }

    @PutMapping("/sessions/{id}/finish")
    public ResponseEntity<?> finishSession(@PathVariable Long id,
                                           @RequestBody Map<String, Object> body,
                                           @AuthenticationPrincipal User user) {
        return studySessionRepository.findById(id)
                .map(session -> {
                    if (!session.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                    }
                    LocalDateTime endedAt = dateTimeOrNow(body.get("endedAt"));
                    if (!endedAt.isAfter(session.getStartedAt())) {
                        return ResponseEntity.badRequest().body(Map.of("error", "INVALID_SESSION_TIME"));
                    }
                    session.setEndedAt(endedAt);
                    session.setDurationMinutes((int) ChronoUnit.MINUTES.between(session.getStartedAt(), endedAt));
                    session.setFocusScore(score(body.get("focusScore")));
                    session.setDifficultyScore(score(body.get("difficultyScore")));
                    session.setNotes(text(body.get("notes")));
                    session.setLearned(text(body.get("learned")));
                    session.setNextStep(text(body.get("nextStep")));
                    StudySession saved = studySessionRepository.save(session);
                    if (Boolean.TRUE.equals(body.get("createReview"))) {
                        createReviewSchedule(saved);
                    }
                    return ResponseEntity.ok(sessionResponse(saved));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/sessions/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return studySessionRepository.findById(id)
                .filter(session -> session.getUser().getId().equals(user.getId()))
                .map(session -> {
                    studySessionRepository.delete(session);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/reviews")
    public List<Map<String, Object>> getReviews(@RequestParam(defaultValue = "false") boolean dueOnly,
                                                @AuthenticationPrincipal User user) {
        List<StudyReview> reviews = dueOnly
                ? studyReviewRepository.findByUserIdAndReviewDateLessThanEqualAndStatusOrderByReviewDateAsc(user.getId(), LocalDate.now(), "PENDING")
                : studyReviewRepository.findByUserIdAndStatusOrderByReviewDateAsc(user.getId(), "PENDING");
        return reviews.stream().map(this::reviewResponse).toList();
    }

    @PatchMapping("/reviews/{id}")
    public ResponseEntity<?> updateReview(@PathVariable Long id,
                                          @RequestBody Map<String, Object> body,
                                          @AuthenticationPrincipal User user) {
        return studyReviewRepository.findById(id)
                .map(review -> {
                    if (!review.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                    }
                    if (body.containsKey("masteryScore")) review.setMasteryScore(score(body.get("masteryScore")));
                    if (body.containsKey("status")) review.setStatus(textOrDefault(body.get("status"), "PENDING").toUpperCase());
                    if (body.containsKey("notes")) review.setNotes(text(body.get("notes")));
                    return ResponseEntity.ok(reviewResponse(studyReviewRepository.save(review)));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/summary")
    public Map<String, Object> getSummary(@AuthenticationPrincipal User user) {
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.with(DayOfWeek.MONDAY);
        LocalDateTime from = weekStart.atStartOfDay();
        LocalDateTime to = weekStart.plusDays(7).atStartOfDay();
        List<StudySession> weekSessions = studySessionRepository
                .findByUserIdAndStartedAtBetweenOrderByStartedAtDesc(user.getId(), from, to);
        int weekMinutes = weekSessions.stream()
                .map(StudySession::getDurationMinutes)
                .filter(v -> v != null)
                .reduce(0, Integer::sum);
        double focusAverage = weekSessions.stream()
                .map(StudySession::getFocusScore)
                .filter(v -> v != null)
                .mapToInt(Short::intValue)
                .average()
                .orElse(0.0);
        var activeSession = studySessionRepository.findFirstByUserIdAndEndedAtIsNullOrderByStartedAtDesc(user.getId())
                .map(this::sessionResponse)
                .orElse(null);
        int dueReviews = studyReviewRepository
                .findByUserIdAndReviewDateLessThanEqualAndStatusOrderByReviewDateAsc(user.getId(), today, "PENDING")
                .size();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("weekMinutes", weekMinutes);
        response.put("weekSessions", weekSessions.size());
        response.put("focusAverage", Math.round(focusAverage * 10.0) / 10.0);
        response.put("dueReviews", dueReviews);
        response.put("activeSession", activeSession);
        return response;
    }

    private void createReviewSchedule(StudySession session) {
        int[] offsets = {1, 3, 7, 14};
        for (int offset : offsets) {
            StudyReview review = StudyReview.builder()
                    .user(session.getUser())
                    .topic(session.getTopic())
                    .session(session)
                    .reviewDate(LocalDate.now().plusDays(offset))
                    .build();
            studyReviewRepository.save(review);
        }
    }

    private Map<String, Object> topicResponse(StudyTopic topic) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", topic.getId());
        m.put("name", topic.getName());
        m.put("color", topic.getColor());
        m.put("goal", topic.getGoal());
        m.put("targetHours", topic.getTargetHours());
        m.put("deadline", topic.getDeadline());
        m.put("createdAt", topic.getCreatedAt());
        return m;
    }

    private Map<String, Object> sessionResponse(StudySession session) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", session.getId());
        m.put("topic", session.getTopic() != null ? topicResponse(session.getTopic()) : null);
        m.put("title", session.getTitle());
        m.put("startedAt", session.getStartedAt());
        m.put("endedAt", session.getEndedAt());
        m.put("durationMinutes", session.getDurationMinutes());
        m.put("focusScore", session.getFocusScore());
        m.put("difficultyScore", session.getDifficultyScore());
        m.put("notes", session.getNotes());
        m.put("learned", session.getLearned());
        m.put("nextStep", session.getNextStep());
        return m;
    }

    private Map<String, Object> reviewResponse(StudyReview review) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", review.getId());
        m.put("topic", review.getTopic() != null ? topicResponse(review.getTopic()) : null);
        m.put("sessionId", review.getSession() != null ? review.getSession().getId() : null);
        m.put("sessionTitle", review.getSession() != null ? review.getSession().getTitle() : null);
        m.put("reviewDate", review.getReviewDate());
        m.put("masteryScore", review.getMasteryScore());
        m.put("status", review.getStatus());
        m.put("notes", review.getNotes());
        return m;
    }

    private String text(Object value) {
        if (!(value instanceof String s) || s.isBlank()) return null;
        return s.trim();
    }

    private String textOrDefault(Object value, String fallback) {
        String text = text(value);
        return text == null ? fallback : text;
    }

    private Integer intValue(Object value) {
        if (value == null || String.valueOf(value).isBlank()) return null;
        try {
            return Integer.parseInt(String.valueOf(value));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Long longValue(Object value) {
        if (value == null || String.valueOf(value).isBlank()) return null;
        try {
            return Long.parseLong(String.valueOf(value));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Short score(Object value) {
        if (value == null || String.valueOf(value).isBlank()) return null;
        try {
            short score = Short.parseShort(String.valueOf(value));
            return score >= 1 && score <= 5 ? score : null;
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private LocalDate dateValue(Object value) {
        if (!(value instanceof String s) || s.isBlank()) return null;
        try {
            return LocalDate.parse(s);
        } catch (Exception e) {
            return null;
        }
    }

    private LocalDateTime dateTimeOrNow(Object value) {
        if (value instanceof String s && !s.isBlank()) {
            try {
                return LocalDateTime.parse(s);
            } catch (Exception ignored) {
                return LocalDateTime.now();
            }
        }
        return LocalDateTime.now();
    }
}
