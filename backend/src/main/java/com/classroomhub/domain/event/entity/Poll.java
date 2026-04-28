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
@Table(name = "polls")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Poll {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(name = "classroom_id", nullable = false)
    UUID classroomId;

    @Column(nullable = false, length = 500)
    String question;

    @Column(name = "multi_choice", nullable = false)
    @Builder.Default
    boolean multiChoice = false;

    @Column(nullable = false)
    @Builder.Default
    boolean anonymous = false;

    @Column(name = "closes_at")
    Instant closesAt;

    @Column(name = "created_by_id", nullable = false)
    UUID createdById;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    Instant updatedAt;

    public boolean isOpen() {
        return closesAt == null || Instant.now().isBefore(closesAt);
    }
}
