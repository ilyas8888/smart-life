package com.smartlife.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "plan_days")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PlanDay {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    @JsonIgnore
    private WorkoutPlan plan;

    @Column(name = "day_number", nullable = false)
    private Integer dayNumber;

    @Column(nullable = false)
    private String label;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    @Builder.Default
    private List<Map<String, Object>> exercises = new ArrayList<>();
}
