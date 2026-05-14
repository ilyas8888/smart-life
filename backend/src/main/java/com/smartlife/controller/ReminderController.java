package com.smartlife.controller;

import com.smartlife.model.Reminder;
import com.smartlife.model.User;
import com.smartlife.repository.ReminderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reminders")
@RequiredArgsConstructor
public class ReminderController {

    private final ReminderRepository reminderRepository;

    @GetMapping
    public List<Reminder> getReminders(@AuthenticationPrincipal User user) {
        return reminderRepository.findByUserIdAndIsDoneFalseOrderByRemindAtAsc(user.getId());
    }

    @PatchMapping("/{id}/done")
    public ResponseEntity<Reminder> markDone(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return reminderRepository.findById(id)
                .filter(r -> r.getUser().getId().equals(user.getId()))
                .map(r -> { r.setDone(true); return ResponseEntity.ok(reminderRepository.save(r)); })
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
