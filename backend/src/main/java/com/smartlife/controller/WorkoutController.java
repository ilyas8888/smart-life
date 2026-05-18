package com.smartlife.controller;

import com.smartlife.model.User;
import com.smartlife.model.WorkoutExercise;
import com.smartlife.model.WorkoutSession;
import com.smartlife.repository.WorkoutSessionRepository;
import com.smartlife.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workouts")
@RequiredArgsConstructor
public class WorkoutController {

    private final WorkoutSessionRepository workoutSessionRepository;
    private final AiService aiService;

    @GetMapping
    public List<WorkoutSession> getSessions(@AuthenticationPrincipal User user) {
        return workoutSessionRepository.findByUserIdOrderBySessionDateDescCreatedAtDesc(user.getId());
    }

    @PostMapping
    @SuppressWarnings("unchecked")
    public ResponseEntity<WorkoutSession> createSession(@RequestBody Map<String, Object> body,
                                                        @AuthenticationPrincipal User user) {
        WorkoutSession session = WorkoutSession.builder()
                .user(user)
                .title((String) body.get("title"))
                .durationMinutes(body.get("durationMinutes") != null ? ((Number) body.get("durationMinutes")).intValue() : null)
                .caloriesBurned(body.get("caloriesBurned") != null ? ((Number) body.get("caloriesBurned")).intValue() : null)
                .notes((String) body.get("notes"))
                .build();

        List<Map<String, Object>> exercisesRaw = (List<Map<String, Object>>) body.getOrDefault("exercises", List.of());
        for (var ex : exercisesRaw) {
            WorkoutExercise exercise = WorkoutExercise.builder()
                    .session(session)
                    .name((String) ex.get("name"))
                    .sets(ex.get("sets") != null ? ((Number) ex.get("sets")).intValue() : null)
                    .reps(ex.get("reps") != null ? ((Number) ex.get("reps")).intValue() : null)
                    .weightKg(ex.get("weightKg") != null ? BigDecimal.valueOf(((Number) ex.get("weightKg")).doubleValue()) : null)
                    .durationSeconds(ex.get("durationSeconds") != null ? ((Number) ex.get("durationSeconds")).intValue() : null)
                    .build();
            session.getExercises().add(exercise);
        }

        return ResponseEntity.ok(workoutSessionRepository.save(session));
    }

    @PostMapping("/from-prompt")
    public ResponseEntity<WorkoutSession> createFromPrompt(@RequestBody Map<String, Object> body,
                                                           @AuthenticationPrincipal User user) {
        String prompt = (String) body.get("prompt");
        return ResponseEntity.ok(aiService.addWorkoutFromPrompt(prompt, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return workoutSessionRepository.findById(id)
                .filter(s -> s.getUser().getId().equals(user.getId()))
                .map(s -> { workoutSessionRepository.delete(s); return ResponseEntity.noContent().<Void>build(); })
                .orElse(ResponseEntity.notFound().build());
    }
}
