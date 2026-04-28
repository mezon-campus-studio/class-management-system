package com.classroomhub.domain.evaluation.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "student_evaluations", indexes = {
        @Index(name = "idx_eval_classroom", columnList = "classroom_id"),
        @Index(name = "idx_eval_student",   columnList = "student_id"),
        @Index(name = "idx_eval_teacher",   columnList = "teacher_id")
})
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StudentEvaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(name = "classroom_id", nullable = false)
    UUID classroomId;

    @Column(name = "student_id", nullable = false)
    UUID studentId;

    @Column(name = "teacher_id", nullable = false)
    UUID teacherId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    Category category = Category.GENERAL;

    /** Optional 0-10 score */
    @Column
    Integer score;

    @Column(length = 200)
    String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    String content;

    /** Period label, e.g. "2024-HK1", "2024-T10" */
    @Column(length = 50)
    String period;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    Instant updatedAt;

    public enum Category {
        ACADEMIC,    // Học lực
        BEHAVIOR,    // Hạnh kiểm
        ACHIEVEMENT, // Thành tích / khen thưởng
        DISCIPLINE,  // Kỷ luật
        GENERAL      // Nhận xét chung
    }
}
