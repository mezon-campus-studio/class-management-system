package com.classroomhub.domain.timetable.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "swap_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SwapRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(name = "requester_id", nullable = false)
    UUID requesterId;

    @Column(name = "requester_entry_id", nullable = false)
    UUID requesterEntryId;

    @Column(name = "target_teacher_id", nullable = false)
    UUID targetTeacherId;

    @Column(name = "target_entry_id")
    UUID targetEntryId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    Status status = Status.PENDING;

    @Column(columnDefinition = "TEXT")
    String reason;

    @Column(name = "reviewed_by_id")
    UUID reviewedById;

    @Column(name = "review_note", columnDefinition = "TEXT")
    String reviewNote;

    @Column(name = "reviewed_at")
    Instant reviewedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    Instant createdAt;

    public enum Status {
        PENDING, APPROVED, REJECTED, CANCELLED
    }
}
