package com.classroomhub.domain.attendance.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "attendance_records",
        uniqueConstraints = @UniqueConstraint(columnNames = {"session_id", "user_id"}))
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "session_id", nullable = false)
    private UUID sessionId;

    @Column(name = "classroom_id", nullable = false)
    private UUID classroomId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.ABSENT;

    @Column(length = 500)
    private String note;

    /** Who last updated this record. */
    @Column(name = "reviewed_by")
    private UUID reviewedBy;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @CreatedDate
    @Column(name = "checked_in_at", nullable = false, updatable = false)
    private Instant checkedInAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public enum Status {
        PRESENT,   // Có mặt
        ABSENT,    // Vắng không phép
        LATE,      // Đi muộn
        EXCUSED    // Vắng có phép
    }
}
