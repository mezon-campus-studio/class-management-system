package com.classroomhub.domain.timetable.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Entity
@Table(name = "teacher_subjects",
        uniqueConstraints = @UniqueConstraint(columnNames = {"teacher_id", "subject_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TeacherSubject {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(name = "teacher_id", nullable = false)
    UUID teacherId;

    @Column(name = "subject_id", nullable = false)
    UUID subjectId;
}
