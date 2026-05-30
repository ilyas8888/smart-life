package com.smartlife.repository;

import com.smartlife.model.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ReminderRepository extends JpaRepository<Reminder, Long> {
    List<Reminder> findByUserIdOrderByRemindAtAsc(Long userId);
    List<Reminder> findByUserIdAndIsDoneFalseOrderByRemindAtAsc(Long userId);
    List<Reminder> findByRemindAtBeforeAndIsDoneFalse(LocalDateTime dateTime);

    @Query("SELECT r FROM Reminder r WHERE r.remindAt <= :now AND r.isDone = false AND r.pushSentAt IS NULL")
    List<Reminder> findPendingForPush(@Param("now") LocalDateTime now);
}
