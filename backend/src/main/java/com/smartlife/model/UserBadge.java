package com.smartlife.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_badges")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserBadge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(name = "badge_type", nullable = false, length = 50)
    private String badgeType;

    @Column(name = "earned_at", nullable = false, updatable = false)
    private LocalDateTime earnedAt;

    @PrePersist
    protected void onCreate() { earnedAt = LocalDateTime.now(); }
}
