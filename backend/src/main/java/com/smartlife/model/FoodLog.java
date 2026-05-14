package com.smartlife.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "food_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FoodLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    private LocalDate logDate = LocalDate.now();

    private String mealType;

    @Column(nullable = false)
    private String foodItem;

    private Integer calories;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime loggedAt;

    @PrePersist
    protected void onCreate() { loggedAt = LocalDateTime.now(); }
}
