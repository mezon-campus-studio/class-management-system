package com.classroomhub.domain.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

/**
 * Single-use refresh token with family-based abuse detection.
 *
 * Rotation flow:
 *  1. On login  → new family (familyId = new UUID), status = ACTIVE
 *  2. On refresh → old token marked USED, new token issued with same familyId
 *  3. If USED token received again → ALL tokens of that family revoked (stolen token detected)
 */
@Entity
@Table(name = "refresh_tokens", indexes = {
        @Index(name = "idx_rt_token", columnList = "token", unique = true),
        @Index(name = "idx_rt_user", columnList = "user_id"),
        @Index(name = "idx_rt_family", columnList = "family_id")
})
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(nullable = false, unique = true, length = 128)
    String token;

    @Column(name = "user_id", nullable = false)
    UUID userId;

    /** All tokens sharing a familyId were created in the same login session. */
    @Column(name = "family_id", nullable = false)
    UUID familyId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    Status status = Status.ACTIVE;

    @Column(name = "expires_at", nullable = false)
    Instant expiresAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    Instant createdAt;

    @Column(name = "used_at")
    Instant usedAt;

    @Column(name = "revoked_at")
    Instant revokedAt;

    /** Number of times this family chain has been refreshed (for analytics). */
    @Column(name = "use_count", nullable = false)
    @Builder.Default
    int useCount = 0;

    /**
     * SHA-256 of the clientId generated in the browser.
     * Null for legacy tokens created before client binding was introduced.
     * If present, must match on every refresh attempt.
     */
    @Column(name = "client_id_hash", length = 64)
    String clientIdHash;

    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }

    public boolean isUsable() {
        return status == Status.ACTIVE && !isExpired();
    }

    public enum Status { ACTIVE, USED, REVOKED }
}
