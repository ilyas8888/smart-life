package com.smartlife.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "task_checklists")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskChecklist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    @JsonIgnore
    private Task task;

    @Column(nullable = false, length = 300)
    private String text;

    @Builder.Default
    @Column(nullable = false)
    private boolean done = false;

    @Builder.Default
    @Column(nullable = false)
    private int position = 0;

    @Builder.Default
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
