package com.smartlife.controller;

import com.smartlife.dto.TimelineItemDto;
import com.smartlife.model.User;
import com.smartlife.service.TimelineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/timeline")
@RequiredArgsConstructor
public class TimelineController {

    private final TimelineService timelineService;

    @GetMapping
    public ResponseEntity<Map<String, List<TimelineItemDto>>> getTimeline(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(timelineService.getTimeline(user));
    }
}
