package com.smartlife.controller;

import com.smartlife.model.SleepEnvironmentPlan;
import com.smartlife.model.SleepPlan;
import com.smartlife.model.User;
import com.smartlife.repository.SleepEnvironmentPlanRepository;
import com.smartlife.repository.SleepPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/sleep")
@RequiredArgsConstructor
public class SleepPlanController {

    private static final String DEFAULT_STEPS = "[{\"id\":\"caffeine\",\"label\":\"Derniere cafeine\",\"minutesBefore\":360,\"enabled\":true},{\"id\":\"meal\",\"label\":\"Dernier repas lourd\",\"minutesBefore\":180,\"enabled\":true},{\"id\":\"screens\",\"label\":\"Ecrans eteints\",\"minutesBefore\":60,\"enabled\":true},{\"id\":\"room\",\"label\":\"Chambre preparee\",\"minutesBefore\":30,\"enabled\":true},{\"id\":\"relax\",\"label\":\"Relaxation lecture\",\"minutesBefore\":10,\"enabled\":true}]";

    private final SleepPlanRepository sleepPlanRepository;
    private final SleepEnvironmentPlanRepository environmentPlanRepository;

    @GetMapping("/plans/{date}")
    public ResponseEntity<?> getPlan(@PathVariable String date) {
        User user = currentUser();
        return sleepPlanRepository.findByUserIdAndPlanDate(user.getId(), LocalDate.parse(date))
                .map(plan -> ResponseEntity.ok(toResponse(plan)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/plans/{date}")
    public ResponseEntity<?> upsertPlan(@PathVariable String date, @RequestBody Map<String, Object> body) {
        User user = currentUser();
        LocalDate planDate = LocalDate.parse(date);
        LocalTime targetBedtime = parseTime(body.get("targetBedtime"));
        LocalTime targetWakeTime = parseTime(body.get("targetWakeTime"));

        if (targetBedtime == null || targetWakeTime == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "INVALID_SLEEP_PLAN"));
        }

        SleepPlan plan = sleepPlanRepository.findByUserIdAndPlanDate(user.getId(), planDate)
                .orElseGet(() -> SleepPlan.builder().user(user).planDate(planDate).build());

        plan.setTargetBedtime(targetBedtime);
        plan.setTargetWakeTime(targetWakeTime);
        plan.setNotes(body.get("notes") instanceof String notes ? notes.trim() : null);

        return ResponseEntity.ok(toResponse(sleepPlanRepository.save(plan)));
    }

    @GetMapping("/environment-plan")
    public ResponseEntity<?> getEnvironmentPlan() {
        User user = currentUser();
        return environmentPlanRepository.findByUserId(user.getId())
                .map(plan -> ResponseEntity.ok(toResponse(plan)))
                .orElseGet(() -> {
                    Map<String, Object> response = new LinkedHashMap<>();
                    response.put("targetBedtime", null);
                    response.put("steps", DEFAULT_STEPS);
                    return ResponseEntity.ok(response);
                });
    }

    @PutMapping("/environment-plan")
    public ResponseEntity<?> upsertEnvironmentPlan(@RequestBody Map<String, Object> body) {
        User user = currentUser();
        LocalTime targetBedtime = parseOptionalTime(body.get("targetBedtime"));
        String steps = body.get("steps") instanceof String value ? value : null;

        if (body.get("targetBedtime") != null && targetBedtime == null || steps == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "INVALID_SLEEP_ENVIRONMENT_PLAN"));
        }

        SleepEnvironmentPlan plan = environmentPlanRepository.findByUserId(user.getId())
                .orElseGet(() -> SleepEnvironmentPlan.builder().user(user).build());

        plan.setTargetBedtime(targetBedtime);
        plan.setSteps(steps);

        return ResponseEntity.ok(toResponse(environmentPlanRepository.save(plan)));
    }

    private Map<String, Object> toResponse(SleepPlan plan) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", plan.getId());
        response.put("planDate", plan.getPlanDate().toString());
        response.put("targetBedtime", plan.getTargetBedtime().toString());
        response.put("targetWakeTime", plan.getTargetWakeTime().toString());
        response.put("notes", plan.getNotes());
        response.put("createdAt", plan.getCreatedAt().toString());
        return response;
    }

    private Map<String, Object> toResponse(SleepEnvironmentPlan plan) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", plan.getId());
        response.put("targetBedtime", plan.getTargetBedtime() != null ? plan.getTargetBedtime().toString() : null);
        response.put("steps", plan.getSteps());
        response.put("createdAt", plan.getCreatedAt().toString());
        return response;
    }

    private User currentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private LocalTime parseTime(Object value) {
        if (!(value instanceof String text) || text.isBlank()) return null;
        try {
            return LocalTime.parse(text);
        } catch (DateTimeParseException e) {
            return null;
        }
    }

    private LocalTime parseOptionalTime(Object value) {
        if (value == null) return null;
        return parseTime(value);
    }
}
