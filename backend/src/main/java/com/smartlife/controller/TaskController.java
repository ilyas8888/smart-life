package com.smartlife.controller;

import com.smartlife.model.Task;
import com.smartlife.model.User;
import com.smartlife.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskRepository taskRepository;

    @GetMapping
    public List<Task> getTasks(@AuthenticationPrincipal User user) {
        return taskRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Task> updateStatus(
            @PathVariable Long id,
            @RequestParam Task.TaskStatus status,
            @AuthenticationPrincipal User user) {
        return taskRepository.findById(id)
                .filter(t -> t.getUser().getId().equals(user.getId()))
                .map(t -> { t.setStatus(status); return ResponseEntity.ok(taskRepository.save(t)); })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return taskRepository.findById(id)
                .filter(t -> t.getUser().getId().equals(user.getId()))
                .map(t -> { taskRepository.delete(t); return ResponseEntity.noContent().<Void>build(); })
                .orElse(ResponseEntity.notFound().build());
    }
}
