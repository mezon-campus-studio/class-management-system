package com.classroomhub.domain.timetable.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "subjects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(nullable = false, length = 100)
    String name;

    @Column(nullable = false, length = 20, unique = true)
    String code;

    @Column(name = "periods_per_week", nullable = false)
    @Builder.Default
    int periodsPerWeek = 1;

    @Column(name = "color_hex", nullable = false, length = 7)
    @Builder.Default
    String colorHex = "#C2714F";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    Instant createdAt;
}
