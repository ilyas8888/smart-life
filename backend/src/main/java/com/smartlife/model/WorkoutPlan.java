package com.smartlife.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "workout_plans")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WorkoutPlan {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String goal;

    @Column(nullable = false)
    private Integer weeks;

    @Column(name = "days_per_week", nullable = false)
    private Integer daysPerWeek;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private LocalDate startDate;

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("dayNumber ASC")
    @Builder.Default
    private List<PlanDay> days = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (startDate == null) startDate = LocalDate.now();
        if (status == null) status = "ACTIVE";
    }
}
