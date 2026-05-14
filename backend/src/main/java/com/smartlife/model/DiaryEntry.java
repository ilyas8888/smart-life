package com.smartlife.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Array;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "diary_entries")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DiaryEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    private LocalDate entryDate = LocalDate.now();

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    private String mood;

    @Column(columnDefinition = "TEXT[]")
    private String[] tags;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
