package com.classroomhub.domain.parent.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "parent_links", indexes = {
        @Index(name = "idx_parent_links_parent", columnList = "parent_id"),
        @Index(name = "idx_parent_links_student", columnList = "student_id"),
        @Index(name = "uq_parent_links_pair", columnList = "parent_id,student_id", unique = true)
})
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ParentLink {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(name = "parent_id", nullable = false)
    UUID parentId;

    @Column(name = "student_id", nullable = false)
    UUID studentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    Status status = Status.ACTIVE;

    /** Quan hệ tự khai báo lúc đăng ký: FATHER, MOTHER, GUARDIAN. */
    @Column(name = "relationship", length = 20)
    String relationship;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    Instant createdAt;

    public enum Status { ACTIVE, REVOKED }
}
