package com.smartlife.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "food_cache")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FoodCache {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String foodName;

    @Column(nullable = false, unique = true)
    private String foodNameNormalized;

    private BigDecimal calories;

    @Column(name = "protein_g")
    private BigDecimal proteinG;

    @Column(name = "carbs_g")
    private BigDecimal carbsG;

    @Column(name = "fat_g")
    private BigDecimal fatG;

    @Column(name = "fiber_g")
    private BigDecimal fiberG;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> nutritionDetails;

    private Integer hitCount = 1;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime lastUsedAt = LocalDateTime.now();
}
