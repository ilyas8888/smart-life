package com.smartlife.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "social_posts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SocialPost {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    @JsonIgnore
    private User author;

    @Column(name = "resource_type", nullable = false)
    private String resourceType;

    @Column(name = "resource_id", nullable = false)
    private Long resourceId;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String caption;

    @Builder.Default
    private String visibility = "PUBLIC";

    @Builder.Default
    @Column(name = "reactions_count", nullable = false)
    private Integer reactionsCount = 0;

    @Builder.Default
    @Column(name = "comments_count", nullable = false)
    private Integer commentsCount = 0;

    @Builder.Default
    @Column(name = "saves_count", nullable = false)
    private Integer savesCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
