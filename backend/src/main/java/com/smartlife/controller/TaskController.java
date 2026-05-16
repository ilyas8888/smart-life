package com.smartlife.controller;

import com.smartlife.model.Task;
import com.smartlife.model.User;
import com.smartlife.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskRepository taskRepository;

    @GetMapping
    public List<Task> getTasks(@AuthenticationPrincipal User user) {
        return taskRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody Map<String, Object> body,
                                           @AuthenticationPrincipal User user) {
        Task task = Task.builder()
                .user(user)
                .title((String) body.get("title"))
                .description((String) body.getOrDefault("description", ""))
                .status(Task.TaskStatus.valueOf((String) body.getOrDefault("status", "TODO")))
                .priority(Task.Priority.valueOf((String) body.getOrDefault("priority", "MEDIUM")))
                .dueDate(body.get("dueDate") != null ? LocalDateTime.parse((String) body.get("dueDate")) : null)
                .build();
        return ResponseEntity.ok(taskRepository.save(task));
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
