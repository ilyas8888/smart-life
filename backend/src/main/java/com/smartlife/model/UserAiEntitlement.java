package com.smartlife.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_ai_entitlements")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserAiEntitlement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String status = "FREE";

    @Builder.Default
    @Column(length = 50)
    private String planName = "Free";

    @Builder.Default
    @Column(nullable = false)
    private Integer trialQuota = 5;

    @Builder.Default
    @Column(nullable = false)
    private Integer trialUsed = 0;

    private Integer monthlyQuota;

    @Builder.Default
    @Column(nullable = false)
    private Integer monthlyUsed = 0;

    @Column(name = "sleep_ai_used", nullable = false)
    @Builder.Default
    private Integer sleepAiUsed = 0;

    @Column(name = "sleep_ai_quota", nullable = false)
    @Builder.Default
    private Integer sleepAiQuota = 5;

    private Long approvedBy;
    private LocalDateTime approvedAt;
    private LocalDateTime expiresAt;
    private LocalDateTime resetAt;

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        var now = LocalDateTime.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
        if (resetAt == null) resetAt = now.withDayOfMonth(1).plusMonths(1).toLocalDate().atStartOfDay();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
