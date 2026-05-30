package com.smartlife.scheduler;

import com.smartlife.model.Reminder;
import com.smartlife.repository.ReminderRepository;
import com.smartlife.service.PushNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReminderPushScheduler {

    private final ReminderRepository reminderRepository;
    private final PushNotificationService pushNotificationService;

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    @Scheduled(fixedDelay = 60_000)
    @Transactional
    public void checkDueReminders() {
        if (!pushNotificationService.isConfigured()) return;

        List<Reminder> due = reminderRepository.findPendingForPush(LocalDateTime.now());
        if (due.isEmpty()) return;

        log.debug("Sending push for {} due reminder(s)", due.size());

        for (Reminder reminder : due) {
            String time = reminder.getRemindAt().format(TIME_FMT);
            String body = reminder.getDescription() != null && !reminder.getDescription().isBlank()
                    ? reminder.getDescription()
                    : "Rappel prévu à " + time;

            pushNotificationService.sendToUser(
                    reminder.getUser().getId(),
                    "⏰ " + reminder.getTitle(),
                    body,
                    "/smart-life/#reminders"
            );

            reminder.setPushSentAt(LocalDateTime.now());
            reminderRepository.save(reminder);
        }
    }
}
