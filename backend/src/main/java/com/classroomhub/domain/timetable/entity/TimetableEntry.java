package com.classroomhub.domain.timetable.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "timetable_entries",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_timetable_classroom_slot",
                        columnNames = {"classroom_id", "day_of_week", "period", "academic_year", "semester"}),
                @UniqueConstraint(name = "uq_timetable_teacher_slot",
                        columnNames = {"teacher_id", "day_of_week", "period", "academic_year", "semester"})
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TimetableEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(name = "classroom_id", nullable = false)
    UUID classroomId;

    @Column(name = "subject_id", nullable = false)
    UUID subjectId;

    @Column(name = "teacher_id")
    UUID teacherId;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", nullable = false, length = 10)
    DayOfWeek dayOfWeek;

    @Column(nullable = false)
    int period;

    @Column(name = "academic_year", nullable = false, length = 9)
    String academicYear;

    @Column(nullable = false)
    int semester;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    Instant createdAt;

    public enum DayOfWeek {
        MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
    }
}
