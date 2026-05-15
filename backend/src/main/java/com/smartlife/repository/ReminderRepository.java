package com.smartlife.repository;

import com.smartlife.model.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ReminderRepository extends JpaRepository<Reminder, Long> {
    List<Reminder> findByUserIdOrderByRemindAtAsc(Long userId);
    List<Reminder> findByUserIdAndIsDoneFalseOrderByRemindAtAsc(Long userId);
    List<Reminder> findByRemindAtBeforeAndIsDoneFalse(LocalDateTime dateTime);
}
