package com.classroomhub.domain.emulation.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "emulation_entries")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EmulationEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(name = "category_id", nullable = false)
    UUID categoryId;

    @Column(name = "classroom_id", nullable = false)
    UUID classroomId;

    @Column(name = "member_id", nullable = false)
    UUID memberId;

    @Column(nullable = false)
    int score;

    @Column(length = 500)
    String note;

    @Column(name = "recorded_by_id", nullable = false)
    UUID recordedById;

    @Column(name = "occurred_at", nullable = false)
    Instant occurredAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    Instant createdAt;
}
