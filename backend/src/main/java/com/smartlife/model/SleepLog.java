package com.smartlife.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "sleep_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SleepLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(name = "sleep_date", nullable = false)
    private LocalDate sleepDate;

    @Column(name = "bedtime", nullable = false)
    private LocalDateTime bedtime;

    @Column(name = "wake_time", nullable = false)
    private LocalDateTime wakeTime;

    @Column(nullable = false)
    private Short quality;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
