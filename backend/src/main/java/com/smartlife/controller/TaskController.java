package com.smartlife.controller;

import com.smartlife.model.Task;
import com.smartlife.model.TaskChecklist;
import com.smartlife.model.User;
import com.smartlife.repository.TaskChecklistRepository;
import com.smartlife.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskRepository taskRepository;
    private final TaskChecklistRepository taskChecklistRepository;

    @GetMapping
    public List<Map<String, Object>> getTasks(@AuthenticationPrincipal User user) {
        return taskRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toTaskResponse)
                .toList();
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
                .category(normalizeCategory(body.get("category")))
                .startDate(parseDate(body.get("startDate")))
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

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id,
                                           @RequestBody Map<String, Object> body,
                                           @AuthenticationPrincipal User user) {
        return taskRepository.findById(id)
                .filter(t -> t.getUser().getId().equals(user.getId()))
                .map(t -> {
                    if (body.containsKey("title")) t.setTitle((String) body.get("title"));
                    if (body.containsKey("description")) t.setDescription((String) body.get("description"));
                    if (body.containsKey("priority")) t.setPriority(Task.Priority.valueOf((String) body.get("priority")));
                    if (body.containsKey("status")) t.setStatus(Task.TaskStatus.valueOf((String) body.get("status")));
                    if (body.containsKey("category")) t.setCategory(normalizeCategory(body.get("category")));
                    if (body.containsKey("startDate")) t.setStartDate(parseDate(body.get("startDate")));
                    if (body.containsKey("dueDate")) t.setDueDate(body.get("dueDate") != null ? LocalDateTime.parse((String) body.get("dueDate")) : null);
                    return ResponseEntity.ok(taskRepository.save(t));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{taskId}/checklist")
    public ResponseEntity<TaskChecklist> createChecklistItem(@PathVariable Long taskId,
                                                             @RequestBody Map<String, Object> body,
                                                             @AuthenticationPrincipal User user) {
        return taskRepository.findById(taskId)
                .filter(t -> t.getUser().getId().equals(user.getId()))
                .map(task -> {
                    String text = normalizeChecklistText(body.get("text"));
                    if (text == null) {
                        return ResponseEntity.badRequest().<TaskChecklist>build();
                    }
                    int position = taskChecklistRepository.findByTaskIdOrderByPositionAsc(taskId).size();
                    TaskChecklist item = TaskChecklist.builder()
                            .task(task)
                            .text(text)
                            .position(position)
                            .build();
                    return ResponseEntity.ok(taskChecklistRepository.save(item));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{taskId}/checklist/{itemId}")
    public ResponseEntity<TaskChecklist> updateChecklistItem(@PathVariable Long taskId,
                                                             @PathVariable Long itemId,
                                                             @RequestBody Map<String, Object> body,
                                                             @AuthenticationPrincipal User user) {
        return taskChecklistRepository.findById(itemId)
                .filter(item -> item.getTask().getId().equals(taskId))
                .filter(item -> item.getTask().getUser().getId().equals(user.getId()))
                .map(item -> {
                    if (body.containsKey("done") && body.get("done") instanceof Boolean done) {
                        item.setDone(done);
                    }
                    if (body.containsKey("text")) {
                        String text = normalizeChecklistText(body.get("text"));
                        if (text == null) {
                            return ResponseEntity.badRequest().<TaskChecklist>build();
                        }
                        item.setText(text);
                    }
                    return ResponseEntity.ok(taskChecklistRepository.save(item));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{taskId}/checklist/{itemId}")
    public ResponseEntity<Void> deleteChecklistItem(@PathVariable Long taskId,
                                                    @PathVariable Long itemId,
                                                    @AuthenticationPrincipal User user) {
        return taskChecklistRepository.findById(itemId)
                .filter(item -> item.getTask().getId().equals(taskId))
                .filter(item -> item.getTask().getUser().getId().equals(user.getId()))
                .map(item -> {
                    taskChecklistRepository.delete(item);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return taskRepository.findById(id)
                .filter(t -> t.getUser().getId().equals(user.getId()))
                .map(t -> { taskRepository.delete(t); return ResponseEntity.noContent().<Void>build(); })
                .orElse(ResponseEntity.notFound().build());
    }

    private String normalizeCategory(Object rawCategory) {
        if (!(rawCategory instanceof String category) || category.isBlank()) {
            return "PERSONAL";
        }
        return category.trim().toUpperCase();
    }

    private LocalDateTime parseDate(Object rawDate) {
        if (!(rawDate instanceof String date) || date.isBlank()) {
            return null;
        }
        return LocalDateTime.parse(date);
    }

    private String normalizeChecklistText(Object rawText) {
        if (!(rawText instanceof String text) || text.isBlank()) {
            return null;
        }
        return text.trim();
    }

    private Map<String, Object> toTaskResponse(Task task) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", task.getId());
        response.put("title", task.getTitle());
        response.put("description", task.getDescription());
        response.put("status", task.getStatus());
        response.put("priority", task.getPriority());
        response.put("category", task.getCategory());
        response.put("startDate", task.getStartDate());
        response.put("dueDate", task.getDueDate());
        response.put("createdAt", task.getCreatedAt());
        response.put("updatedAt", task.getUpdatedAt());
        response.put("checklist", taskChecklistRepository.findByTaskIdOrderByPositionAsc(task.getId()));
        return response;
    }
}
