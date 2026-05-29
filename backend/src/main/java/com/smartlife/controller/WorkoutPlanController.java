package com.smartlife.controller;

import com.smartlife.model.PlanDay;
import com.smartlife.model.WorkoutPlan;
import com.smartlife.model.User;
import com.smartlife.repository.WorkoutPlanRepository;
import com.smartlife.repository.WorkoutSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workout-plans")
@RequiredArgsConstructor
public class WorkoutPlanController {

    private final WorkoutPlanRepository planRepository;
    private final WorkoutSessionRepository sessionRepository;

    @GetMapping
    public List<WorkoutPlan> getPlans(@AuthenticationPrincipal User user) {
        return planRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    @PostMapping
    @SuppressWarnings("unchecked")
    public ResponseEntity<WorkoutPlan> createPlan(@RequestBody Map<String, Object> body,
                                                  @AuthenticationPrincipal User user) {
        WorkoutPlan plan = WorkoutPlan.builder()
                .user(user)
                .name((String) body.get("name"))
                .goal((String) body.getOrDefault("goal", "GENERAL"))
                .weeks(body.get("weeks") != null ? ((Number) body.get("weeks")).intValue() : 8)
                .daysPerWeek(body.get("daysPerWeek") != null ? ((Number) body.get("daysPerWeek")).intValue() : 3)
                .status("ACTIVE")
                .startDate(LocalDate.now())
                .build();

        List<Map<String, Object>> daysRaw = (List<Map<String, Object>>) body.getOrDefault("days", List.of());
        for (var d : daysRaw) {
            PlanDay day = PlanDay.builder()
                    .plan(plan)
                    .dayNumber(((Number) d.get("dayNumber")).intValue())
                    .label((String) d.get("label"))
                    .exercises((List<Map<String, Object>>) d.getOrDefault("exercises", List.of()))
                    .build();
            plan.getDays().add(day);
        }

        return ResponseEntity.status(201).body(planRepository.save(plan));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkoutPlan> getPlan(@PathVariable Long id,
                                               @AuthenticationPrincipal User user) {
        return planRepository.findById(id)
                .filter(p -> p.getUser().getId().equals(user.getId()))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @SuppressWarnings("unchecked")
    public ResponseEntity<WorkoutPlan> updatePlan(@PathVariable Long id,
                                                   @RequestBody Map<String, Object> body,
                                                   @AuthenticationPrincipal User user) {
        return planRepository.findById(id)
                .filter(p -> p.getUser().getId().equals(user.getId()))
                .map(p -> {
                    if (body.get("name") != null) p.setName((String) body.get("name"));
                    if (body.get("goal") != null) p.setGoal((String) body.get("goal"));
                    if (body.get("weeks") != null) p.setWeeks(((Number) body.get("weeks")).intValue());
                    if (body.get("daysPerWeek") != null) p.setDaysPerWeek(((Number) body.get("daysPerWeek")).intValue());
                    List<Map<String, Object>> daysRaw = (List<Map<String, Object>>) body.get("days");
                    if (daysRaw != null) {
                        p.getDays().clear();
                        for (var d : daysRaw) {
                            PlanDay day = PlanDay.builder()
                                    .plan(p)
                                    .dayNumber(((Number) d.get("dayNumber")).intValue())
                                    .label((String) d.get("label"))
                                    .exercises((List<Map<String, Object>>) d.getOrDefault("exercises", List.of()))
                                    .build();
                            p.getDays().add(day);
                        }
                    }
                    return ResponseEntity.ok(planRepository.save(p));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<WorkoutPlan> updateStatus(@PathVariable Long id,
                                                    @RequestBody Map<String, Object> body,
                                                    @AuthenticationPrincipal User user) {
        return planRepository.findById(id)
                .filter(p -> p.getUser().getId().equals(user.getId()))
                .map(p -> {
                    String newStatus = (String) body.get("status");
                    if (newStatus != null) p.setStatus(newStatus);
                    return ResponseEntity.ok(planRepository.save(p));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlan(@PathVariable Long id,
                                           @AuthenticationPrincipal User user) {
        return planRepository.findById(id)
                .filter(p -> p.getUser().getId().equals(user.getId()))
                .map(p -> {
                    planRepository.delete(p);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/progress")
    public ResponseEntity<Map<String, Object>> getPlanProgress(@PathVariable Long id,
                                                               @AuthenticationPrincipal User user) {
        return planRepository.findById(id)
                .filter(p -> p.getUser().getId().equals(user.getId()))
                .map(p -> {
                    List<Long> dayIds = p.getDays().stream().map(PlanDay::getId).toList();
                    long nonRestDays = p.getDays().stream()
                            .filter(d -> !d.getLabel().equalsIgnoreCase("Repos"))
                            .count();
                    int totalSessions = p.getWeeks() * (int) nonRestDays;
                    long doneSessions = dayIds.isEmpty() ? 0 : sessionRepository.countByPlanDayIdIn(dayIds);
                    int percent = totalSessions > 0 ? (int) Math.min(100, doneSessions * 100L / totalSessions) : 0;
                    long weeksElapsed = Math.min(p.getWeeks(),
                            ChronoUnit.WEEKS.between(p.getStartDate(), LocalDate.now()) + 1);

                    List<Long> completedDayIds = dayIds.isEmpty()
                            ? List.of()
                            : sessionRepository.findByPlanDayIdIn(dayIds).stream()
                                .map(s -> s.getPlanDayId()).filter(did -> did != null).distinct().toList();

                    return ResponseEntity.ok(Map.<String, Object>of(
                            "totalSessions", totalSessions,
                            "doneSessions", doneSessions,
                            "percent", percent,
                            "weeksElapsed", weeksElapsed,
                            "completedDayIds", completedDayIds
                    ));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
