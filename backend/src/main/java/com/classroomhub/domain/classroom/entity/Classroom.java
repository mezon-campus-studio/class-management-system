package com.classroomhub.domain.classroom.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "classrooms")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Classroom {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(name = "cover_image_url")
    private String coverImageUrl;

    @Column(name = "invite_code", unique = true, nullable = false, length = 12)
    private String inviteCode;

    @Column(name = "invite_code_expires_at")
    private Instant inviteCodeExpiresAt;

    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;

    @Column(name = "max_members")
    @Builder.Default
    private int maxMembers = 100;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.ACTIVE;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public enum Status { ACTIVE, ARCHIVED }
}
