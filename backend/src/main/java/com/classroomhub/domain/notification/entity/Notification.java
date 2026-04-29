package com.classroomhub.domain.notification.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_notifications_user", columnList = "user_id,created_at")
})
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(name = "user_id", nullable = false)
    UUID userId;

    @Column(name = "classroom_id")
    UUID classroomId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    Type type;

    @Column(nullable = false, length = 500)
    String title;

    @Column(length = 1000)
    String body;

    @Column(name = "reference_id")
    UUID referenceId;

    boolean read;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    Instant createdAt;

    public enum Type {
        ATTENDANCE_PENDING, ATTENDANCE_APPROVED, ATTENDANCE_REJECTED,
        DUTY_ASSIGNED, DUTY_CONFIRMED, DUTY_REMINDER,
        EVENT_CREATED, EVENT_REMINDER,
        ABSENCE_REQUEST_REVIEWED, ABSENCE_REQUEST_PENDING,
        FUND_PAYMENT_INITIATED, FUND_PAYMENT_CONFIRMED, FUND_PAYMENT_REJECTED, FUND_COLLECTION_CREATED,
        EMULATION_ENTRY_ADDED, EVALUATION_ADDED,
        MESSAGE_RECEIVED, MESSAGE_MENTION, MESSAGE_REACTION,
        GENERAL
    }
}
