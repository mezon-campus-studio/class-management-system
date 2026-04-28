package com.classroomhub.domain.auth.repository;

import com.classroomhub.domain.auth.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {

    Optional<PasswordResetToken> findTopByEmailAndUsedFalseOrderByCreatedAtDesc(String email);

    @Modifying
    @Query("UPDATE PasswordResetToken t SET t.used = true WHERE t.email = :email")
    void invalidateAllByEmail(String email);
}
