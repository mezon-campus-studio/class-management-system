package com.classroomhub.domain.admin.dto;

import com.classroomhub.domain.auth.entity.User;

import java.time.Instant;
import java.util.UUID;

public record AdminUserResponse(
        UUID id,
        String email,
        String displayName,
        String avatarUrl,
        User.UserType userType,
        User.Status status,
        String studentCode,
        Instant createdAt
) {
    public static AdminUserResponse from(User u) {
        return new AdminUserResponse(
                u.getId(), u.getEmail(), u.getDisplayName(), u.getAvatarUrl(),
                u.getUserType(), u.getStatus(), u.getStudentCode(), u.getCreatedAt());
    }
}
