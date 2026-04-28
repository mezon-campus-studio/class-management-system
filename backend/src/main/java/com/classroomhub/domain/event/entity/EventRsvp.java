package com.classroomhub.domain.event.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "event_rsvps",
        uniqueConstraints = @UniqueConstraint(columnNames = {"event_id", "user_id"}))
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EventRsvp {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(name = "event_id", nullable = false)
    UUID eventId;

    @Column(name = "user_id", nullable = false)
    UUID userId;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    Response response;

    @Column(length = 300)
    String note;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    Instant createdAt;

    public enum Response {
        ATTENDING,
        NOT_ATTENDING,
        MAYBE
    }
}
