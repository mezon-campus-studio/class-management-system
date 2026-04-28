package com.classroomhub.domain.event.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "absence_requests")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AbsenceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(name = "classroom_id", nullable = false)
    UUID classroomId;

    @Column(name = "user_id", nullable = false)
    UUID userId;

    @Column(name = "event_id")
    UUID eventId;

    @Column(nullable = false, length = 1000)
    String reason;

    @Column(name = "absence_date")
    java.time.LocalDate absenceDate;

    @Column(length = 1000)
    String note;

    @Column(name = "submitted_by_parent_id")
    UUID submittedByParentId;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    Status status = Status.PENDING;

    @Column(name = "reviewed_by_id")
    UUID reviewedById;

    @Column(name = "review_note", length = 500)
    String reviewNote;

    @Column(name = "reviewed_at")
    Instant reviewedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    Instant updatedAt;

    public enum Status {
        PENDING,
        APPROVED,
        REJECTED
    }
}
