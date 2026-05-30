package com.smartlife.repository;

import com.smartlife.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Task> findByUserIdAndStatusOrderByDueDateAsc(Long userId, Task.TaskStatus status);
    long countByUserId(Long userId);
}
