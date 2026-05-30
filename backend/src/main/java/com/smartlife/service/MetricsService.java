package com.smartlife.service;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MetricsService {

    private final MeterRegistry registry;

    // Business event counters — visible in Grafana as smartlife_* metrics
    public void foodLogCreated()     { counter("food_log.created").increment(); }
    public void workoutCreated()     { counter("workout.created").increment(); }
    public void sleepLogCreated()    { counter("sleep_log.created").increment(); }
    public void studySessionEnded()  { counter("study_session.ended").increment(); }
    public void socialPostCreated()  { counter("social_post.created").increment(); }
    public void aiPromptProcessed()  { counter("ai_prompt.processed").increment(); }
    public void pushSent()           { counter("push_notification.sent").increment(); }
    public void badgeAwarded(String badgeType) {
        registry.counter("smartlife.badge.awarded", "type", badgeType).increment();
    }

    private Counter counter(String name) {
        return registry.counter("smartlife." + name);
    }
}
