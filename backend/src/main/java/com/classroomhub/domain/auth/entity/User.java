package com.classroomhub.domain.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_users_email", columnList = "email", unique = true),
        @Index(name = "idx_users_student_code", columnList = "student_code", unique = true)
})
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(nullable = false, unique = true, length = 255)
    String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    String passwordHash;

    @Column(name = "display_name", nullable = false, length = 100)
    String displayName;

    @Column(name = "avatar_url", length = 500)
    String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "user_type", nullable = false, length = 20)
    UserType userType;

    /** Mã định danh dùng để phụ huynh liên kết với học sinh — chỉ tồn tại khi userType = STUDENT. */
    @Column(name = "student_code", length = 16, unique = true)
    String studentCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    Status status = Status.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    Instant updatedAt;

    public enum UserType { STUDENT, TEACHER, PARENT, SYSTEM_ADMIN }

    public enum Status { ACTIVE, INACTIVE, BANNED }
}
