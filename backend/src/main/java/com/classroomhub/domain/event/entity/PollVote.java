package com.classroomhub.domain.event.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "poll_votes",
        uniqueConstraints = @UniqueConstraint(columnNames = {"poll_id", "option_id", "user_id"}))
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PollVote {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(name = "poll_id", nullable = false)
    UUID pollId;

    @Column(name = "option_id", nullable = false)
    UUID optionId;

    @Column(name = "user_id", nullable = false)
    UUID userId;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    Instant createdAt;
}
