package com.smartlife.controller;

import com.smartlife.model.Reminder;
import com.smartlife.model.User;
import com.smartlife.repository.ReminderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reminders")
@RequiredArgsConstructor
public class ReminderController {

    private final ReminderRepository reminderRepository;

    @GetMapping
    public List<Reminder> getReminders(@RequestParam(defaultValue = "false") boolean includeDone,
                                       @AuthenticationPrincipal User user) {
        if (includeDone) {
            return reminderRepository.findByUserIdOrderByRemindAtAsc(user.getId());
        }
        return reminderRepository.findByUserIdAndIsDoneFalseOrderByRemindAtAsc(user.getId());
    }

    @PostMapping
    public ResponseEntity<Reminder> createReminder(@RequestBody Map<String, Object> body,
                                                   @AuthenticationPrincipal User user) {
        Reminder reminder = Reminder.builder()
                .user(user)
                .title((String) body.get("title"))
                .description((String) body.getOrDefault("description", ""))
                .remindAt(LocalDateTime.parse((String) body.get("remindAt")))
                .priority(body.getOrDefault("priority", "MEDIUM").toString())
                .isDone(false)
                .build();
        return ResponseEntity.ok(reminderRepository.save(reminder));
    }

    @PatchMapping("/{id}/done")
    public ResponseEntity<Reminder> markDone(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return reminderRepository.findById(id)
                .filter(r -> r.getUser().getId().equals(user.getId()))
                .map(r -> { r.setDone(true); return ResponseEntity.ok(reminderRepository.save(r)); })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Reminder> updateReminder(@PathVariable Long id,
                                                   @RequestBody Map<String, Object> body,
                                                   @AuthenticationPrincipal User user) {
        return reminderRepository.findById(id)
                .filter(r -> r.getUser().getId().equals(user.getId()))
                .map(r -> {
                    if (body.containsKey("title")) r.setTitle((String) body.get("title"));
                    if (body.containsKey("description")) r.setDescription((String) body.get("description"));
                    if (body.containsKey("remindAt")) r.setRemindAt(LocalDateTime.parse((String) body.get("remindAt")));
                    if (body.containsKey("priority")) r.setPriority(body.get("priority").toString());
                    return ResponseEntity.ok(reminderRepository.save(r));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReminder(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return reminderRepository.findById(id)
                .filter(r -> r.getUser().getId().equals(user.getId()))
                .map(r -> { reminderRepository.delete(r); return ResponseEntity.noContent().<Void>build(); })
                .orElse(ResponseEntity.notFound().build());
    }
}
