package com.classroomhub.domain.duty.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "duty_assignments")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DutyAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(name = "duty_type_id", nullable = false)
    UUID dutyTypeId;

    @Column(name = "classroom_id", nullable = false)
    UUID classroomId;

    @Column(name = "assigned_to_id", nullable = false)
    UUID assignedToId;

    @Column(name = "duty_date", nullable = false)
    LocalDate dutyDate;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    Status status = Status.PENDING;

    @Column(length = 500)
    String note;

    @Column(name = "confirmed_by_id")
    UUID confirmedById;

    @Column(name = "confirmed_at")
    Instant confirmedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    Instant updatedAt;

    public enum Status {
        PENDING,
        COMPLETED,
        MISSED
    }
}
