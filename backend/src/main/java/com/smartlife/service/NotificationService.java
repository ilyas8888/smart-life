package com.smartlife.service;

import com.smartlife.dto.NotificationDTO;
import io.micrometer.observation.annotation.Observed;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate messaging;

    @Observed(name = "smartlife.notification.send")
    public void notifyUser(String email, NotificationDTO notification) {
        try {
            messaging.convertAndSendToUser(email, "/queue/notifications", notification);
        } catch (Exception ignored) {}
    }
}
