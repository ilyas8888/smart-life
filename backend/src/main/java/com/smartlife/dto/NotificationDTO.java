package com.smartlife.dto;

import java.time.LocalDateTime;

public record NotificationDTO(
        String type,
        String message,
        String actorName,
        Long postId,
        LocalDateTime timestamp
) {}
