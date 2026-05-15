package com.smartlife.dto;

import java.time.LocalDate;
import java.util.Map;

public record TimelineItemDto(
        Long id,
        String type,
        String title,
        String description,
        LocalDate date,
        String time,
        Map<String, Object> metadata
) {
}
