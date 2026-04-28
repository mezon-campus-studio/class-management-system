package com.classroomhub.domain.auth.repository;

import com.classroomhub.domain.auth.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByToken(String token);

    @Modifying
    @Query("UPDATE RefreshToken r SET r.status = 'REVOKED', r.revokedAt = CURRENT_TIMESTAMP " +
           "WHERE r.familyId = :familyId AND r.status = 'ACTIVE'")
    void revokeAllByFamilyId(@Param("familyId") UUID familyId);

    @Modifying
    @Query("UPDATE RefreshToken r SET r.status = 'REVOKED', r.revokedAt = CURRENT_TIMESTAMP " +
           "WHERE r.userId = :userId AND r.status = 'ACTIVE'")
    void revokeAllByUserId(@Param("userId") UUID userId);
}
