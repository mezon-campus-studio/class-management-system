package com.classroomhub.domain.timetable.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "classroom_subject_configs",
    uniqueConstraints = @UniqueConstraint(columnNames = {"classroom_id", "subject_id"})
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ClassroomSubjectConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(name = "classroom_id", nullable = false)
    UUID classroomId;

    @Column(name = "subject_id", nullable = false)
    UUID subjectId;

    @Column(name = "teacher_id")
    UUID teacherId;

    @Column(name = "periods_per_week", nullable = false)
    int periodsPerWeek;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    Instant createdAt;
}
