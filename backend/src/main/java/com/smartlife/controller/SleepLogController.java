package com.smartlife.controller;

import com.smartlife.model.SleepLog;
import com.smartlife.model.User;
import com.smartlife.repository.SleepLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sleep-logs")
@RequiredArgsConstructor
public class SleepLogController {

    private final SleepLogRepository sleepLogRepository;

    @GetMapping
    public List<Map<String, Object>> getLogs(@RequestParam(required = false) String from,
                                              @RequestParam(required = false) String to) {
        User user = currentUser();
        List<SleepLog> logs;
        if (from != null && to != null) {
            logs = sleepLogRepository.findByUserIdAndSleepDateBetweenOrderBySleepDateDesc(
                    user.getId(), LocalDate.parse(from), LocalDate.parse(to));
        } else {
            logs = sleepLogRepository.findByUserIdOrderBySleepDateDesc(user.getId());
        }
        return logs.stream().map(this::toResponse).toList();
    }

    @PostMapping
    public ResponseEntity<?> createLog(@RequestBody Map<String, Object> body) {
        User user = currentUser();
        LocalDateTime bedtime = parseDateTime(body.get("bedtime"));
        LocalDateTime wakeTime = parseDateTime(body.get("wakeTime"));
        Short quality = parseQuality(body.get("quality"));

        if (bedtime == null || wakeTime == null || quality == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "INVALID_SLEEP_LOG"));
        }
        if (!wakeTime.isAfter(bedtime)) {
            return ResponseEntity.badRequest().body(Map.of("error", "WAKE_BEFORE_BED"));
        }

        LocalDate sleepDate = wakeTime.toLocalDate();

        SleepLog log = SleepLog.builder()
                .user(user)
                .sleepDate(sleepDate)
                .bedtime(bedtime)
                .wakeTime(wakeTime)
                .quality(quality)
                .notes(body.get("notes") instanceof String s ? s.trim() : null)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(sleepLogRepository.save(log)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateLog(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        User user = currentUser();
        return sleepLogRepository.findById(id)
                .map(log -> {
                    if (!log.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                    }
                    LocalDateTime bedtime = parseDateTime(body.get("bedtime"));
                    LocalDateTime wakeTime = parseDateTime(body.get("wakeTime"));
                    Short quality = parseQuality(body.get("quality"));

                    if (bedtime == null || wakeTime == null || quality == null) {
                        return ResponseEntity.badRequest().body(Map.of("error", "INVALID_SLEEP_LOG"));
                    }
                    if (!wakeTime.isAfter(bedtime)) {
                        return ResponseEntity.badRequest().body(Map.of("error", "WAKE_BEFORE_BED"));
                    }

                    log.setBedtime(bedtime);
                    log.setWakeTime(wakeTime);
                    log.setSleepDate(wakeTime.toLocalDate());
                    log.setQuality(quality);
                    log.setNotes(body.get("notes") instanceof String s ? s.trim() : null);
                    log.setUpdatedAt(LocalDateTime.now());
                    return ResponseEntity.ok(toResponse(sleepLogRepository.save(log)));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLog(@PathVariable Long id) {
        User user = currentUser();
        return sleepLogRepository.findById(id)
                .map(log -> {
                    if (!log.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).<Void>build();
                    }
                    sleepLogRepository.delete(log);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private Map<String, Object> toResponse(SleepLog log) {
        long durationMinutes = ChronoUnit.MINUTES.between(log.getBedtime(), log.getWakeTime());
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("id", log.getId());
        r.put("sleepDate", log.getSleepDate().toString());
        r.put("bedtime", log.getBedtime().toString());
        r.put("wakeTime", log.getWakeTime().toString());
        r.put("durationMinutes", durationMinutes);
        r.put("quality", log.getQuality());
        r.put("notes", log.getNotes());
        r.put("createdAt", log.getCreatedAt().toString());
        return r;
    }

    private User currentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private LocalDateTime parseDateTime(Object value) {
        if (!(value instanceof String s) || s.isBlank()) return null;
        try {
            return LocalDateTime.parse(s);
        } catch (Exception e) {
            return null;
        }
    }

    private Short parseQuality(Object value) {
        if (value == null) return null;
        try {
            short q = Short.parseShort(String.valueOf(value));
            return (q >= 1 && q <= 5) ? q : null;
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
