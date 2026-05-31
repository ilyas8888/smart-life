package com.smartlife.service;

import com.smartlife.dto.NotificationDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate messaging;

    public void notifyUser(String email, NotificationDTO notification) {
        try {
            messaging.convertAndSendToUser(email, "/queue/notifications", notification);
        } catch (Exception ignored) {}
    }
}
