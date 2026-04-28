package com.classroomhub.domain.auth.service;

import com.classroomhub.common.exception.BusinessException;
import com.classroomhub.common.exception.ErrorCode;
import com.classroomhub.common.security.JwtService;
import com.classroomhub.domain.auth.dto.AuthResponse;
import com.classroomhub.domain.auth.dto.ForgotPasswordRequest;
import com.classroomhub.domain.auth.dto.LoginRequest;
import com.classroomhub.domain.auth.dto.RegisterRequest;
import com.classroomhub.domain.auth.dto.ResetPasswordRequest;
import com.classroomhub.domain.auth.dto.UpdateProfileRequest;
import com.classroomhub.domain.auth.entity.PasswordResetToken;
import com.classroomhub.domain.auth.entity.RefreshToken;
import com.classroomhub.domain.auth.entity.User;
import com.classroomhub.domain.auth.repository.PasswordResetTokenRepository;
import com.classroomhub.domain.auth.repository.RefreshTokenRepository;
import com.classroomhub.domain.auth.repository.UserRepository;
import com.classroomhub.domain.parent.entity.ParentLink;
import com.classroomhub.domain.parent.repository.ParentLinkRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final ParentLinkRepository parentLinkRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;

    @Value("${app.jwt.refresh-token-expiry}")
    private long refreshTokenExpiry;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final long OTP_EXPIRY_MS = 10 * 60 * 1000L; // 10 minutes

    // ─── Public API ───────────────────────────────────────────────────────────────

    @Transactional
    public AuthResponse register(RegisterRequest req, String clientId) {
        if (req.userType() == User.UserType.SYSTEM_ADMIN) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        if (userRepository.existsByEmail(req.email())) {
            throw new BusinessException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        User student = null;
        if (req.userType() == User.UserType.PARENT) {
            if (req.studentCode() == null || req.studentCode().isBlank()) {
                throw new BusinessException(ErrorCode.STUDENT_CODE_REQUIRED);
            }
            student = userRepository.findByStudentCode(req.studentCode().trim().toUpperCase())
                    .filter(u -> u.getUserType() == User.UserType.STUDENT)
                    .orElseThrow(() -> new BusinessException(ErrorCode.STUDENT_NOT_FOUND));
        }

        User user = User.builder()
                .email(req.email())
                .passwordHash(passwordEncoder.encode(req.password()))
                .displayName(req.displayName())
                .userType(req.userType())
                .status(User.Status.ACTIVE)
                .studentCode(req.userType() == User.UserType.STUDENT ? generateStudentCode() : null)
                .build();
        userRepository.save(user);

        if (student != null) {
            parentLinkRepository.save(ParentLink.builder()
                    .parentId(user.getId())
                    .studentId(student.getId())
                    .relationship(req.relationship())
                    .status(ParentLink.Status.ACTIVE)
                    .build());
        }

        return buildAuthResponse(user, clientId);
    }

    @Transactional
    public AuthResponse login(LoginRequest req, String clientId) {
        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_CREDENTIALS));

        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }
        if (user.getStatus() != User.Status.ACTIVE) {
            throw new BusinessException(ErrorCode.ACCOUNT_INACTIVE);
        }

        return buildAuthResponse(user, clientId);
    }

    /**
     * Single-use refresh token rotation with client-binding verification.
     *
     * Security properties:
     * - Presenting a USED token → entire family revoked (replay attack detected)
     * - clientId mismatch → entire family revoked (stolen cookie without matching localStorage key)
     */
    @Transactional
    public AuthResponse refresh(String rawToken, String clientId) {
        RefreshToken stored = refreshTokenRepository.findByToken(rawToken)
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_TOKEN));

        // Token reuse → someone is replaying a used token (possible theft)
        if (stored.getStatus() == RefreshToken.Status.USED) {
            log.warn("Refresh token reuse detected — revoking family={} user={}",
                    stored.getFamilyId(), stored.getUserId());
            refreshTokenRepository.revokeAllByFamilyId(stored.getFamilyId());
            throw new BusinessException(ErrorCode.TOKEN_REUSE_DETECTED);
        }

        if (!stored.isUsable()) {
            throw new BusinessException(ErrorCode.INVALID_TOKEN);
        }

        // Client-binding check: if hash stored, clientId must match
        if (stored.getClientIdHash() != null) {
            if (clientId == null || !stored.getClientIdHash().equals(sha256(clientId))) {
                log.warn("Client-id mismatch on refresh — revoking family={} user={}",
                        stored.getFamilyId(), stored.getUserId());
                refreshTokenRepository.revokeAllByFamilyId(stored.getFamilyId());
                throw new BusinessException(ErrorCode.INVALID_TOKEN);
            }
        }

        User user = userRepository.findById(stored.getUserId())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_TOKEN));
        if (user.getStatus() != User.Status.ACTIVE) {
            throw new BusinessException(ErrorCode.ACCOUNT_INACTIVE);
        }

        // Rotate: mark old as USED, issue new in same family
        stored.setStatus(RefreshToken.Status.USED);
        stored.setUsedAt(Instant.now());
        refreshTokenRepository.save(stored);

        String newRawToken = generateSecureToken();
        RefreshToken newToken = RefreshToken.builder()
                .token(newRawToken)
                .userId(user.getId())
                .familyId(stored.getFamilyId())
                .status(RefreshToken.Status.ACTIVE)
                .useCount(stored.getUseCount() + 1)
                .clientIdHash(stored.getClientIdHash()) // carry binding forward
                .expiresAt(Instant.now().plusMillis(refreshTokenExpiry))
                .build();
        refreshTokenRepository.save(newToken);

        String accessToken = jwtService.generateAccessToken(
                user.getId(), user.getEmail(), user.getUserType().name());

        return new AuthResponse(accessToken, newRawToken, toUserInfo(user));
    }

    @Transactional
    public void logout(String rawToken) {
        refreshTokenRepository.findByToken(rawToken).ifPresent(token -> {
            token.setStatus(RefreshToken.Status.REVOKED);
            token.setRevokedAt(Instant.now());
            refreshTokenRepository.save(token);
        });
    }

    @Transactional
    public void logoutAll(UUID userId) {
        refreshTokenRepository.revokeAllByUserId(userId);
    }

    @Transactional
    public AuthResponse.UserInfo updateProfile(UUID userId, UpdateProfileRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.FORBIDDEN));
        user.setDisplayName(req.displayName());
        if (req.avatarUrl() != null) user.setAvatarUrl(req.avatarUrl());
        userRepository.save(user);
        return toUserInfo(user);
    }

    // ─── Forgot / Reset password ──────────────────────────────────────────────────

    @Transactional
    public void forgotPassword(ForgotPasswordRequest req) {
        // Always respond success to avoid email enumeration
        userRepository.findByEmail(req.email()).ifPresent(user -> {
            // Invalidate any previous unused OTPs for this email
            passwordResetTokenRepository.invalidateAllByEmail(req.email());

            String otp = generateOtp();
            PasswordResetToken token = PasswordResetToken.builder()
                    .email(req.email())
                    .otpHash(sha256(otp))
                    .expiresAt(Instant.now().plusMillis(OTP_EXPIRY_MS))
                    .used(false)
                    .build();
            passwordResetTokenRepository.save(token);

            mailService.sendPasswordResetOtp(req.email(), otp);
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest req) {
        PasswordResetToken token = passwordResetTokenRepository
                .findTopByEmailAndUsedFalseOrderByCreatedAtDesc(req.email())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESET_OTP_INVALID));

        if (token.isExpired()) {
            throw new BusinessException(ErrorCode.RESET_OTP_EXPIRED);
        }
        if (!token.getOtpHash().equals(sha256(req.otp()))) {
            throw new BusinessException(ErrorCode.RESET_OTP_INVALID);
        }

        token.setUsed(true);
        passwordResetTokenRepository.save(token);

        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESET_OTP_INVALID));
        user.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        userRepository.save(user);

        // Revoke all sessions so stolen credentials can't be used
        refreshTokenRepository.revokeAllByUserId(user.getId());
    }

    // ─── Private helpers ──────────────────────────────────────────────────────────

    private AuthResponse buildAuthResponse(User user, String clientId) {
        String accessToken = jwtService.generateAccessToken(
                user.getId(), user.getEmail(), user.getUserType().name());
        String rawToken = generateSecureToken();

        RefreshToken refreshToken = RefreshToken.builder()
                .token(rawToken)
                .userId(user.getId())
                .familyId(UUID.randomUUID())
                .status(RefreshToken.Status.ACTIVE)
                .clientIdHash(clientId != null ? sha256(clientId) : null)
                .expiresAt(Instant.now().plusMillis(refreshTokenExpiry))
                .build();
        refreshTokenRepository.save(refreshToken);

        return new AuthResponse(accessToken, rawToken, toUserInfo(user));
    }

    private static String generateSecureToken() {
        byte[] bytes = new byte[48];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String sha256(String input) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256")
                    .digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }

    private static AuthResponse.UserInfo toUserInfo(User user) {
        return new AuthResponse.UserInfo(
                user.getId(), user.getEmail(),
                user.getDisplayName(), user.getAvatarUrl(), user.getUserType(),
                user.getStudentCode());
    }

    private static String generateOtp() {
        int n = SECURE_RANDOM.nextInt(1_000_000);
        return String.format("%06d", n);
    }

    private String generateStudentCode() {
        final char[] alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".toCharArray();
        for (int attempt = 0; attempt < 5; attempt++) {
            StringBuilder sb = new StringBuilder("STU-");
            for (int i = 0; i < 6; i++) sb.append(alphabet[SECURE_RANDOM.nextInt(alphabet.length)]);
            String code = sb.toString();
            if (userRepository.findByStudentCode(code).isEmpty()) return code;
        }
        throw new BusinessException(ErrorCode.INTERNAL_ERROR);
    }
}
