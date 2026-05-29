package com.smartlife.repository;

import com.smartlife.model.TaskChecklist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskChecklistRepository extends JpaRepository<TaskChecklist, Long> {
    List<TaskChecklist> findByTaskIdOrderByPositionAsc(Long taskId);
}
