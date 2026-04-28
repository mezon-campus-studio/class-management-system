package com.classroomhub.domain.auth.dto;

import com.classroomhub.domain.auth.entity.User;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record AuthResponse(
        String accessToken,
        String refreshToken,
        UserInfo user
) {
    /** Returns a copy with refreshToken stripped — safe to send to client over JSON. */
    public AuthResponse withoutRefreshToken() {
        return new AuthResponse(accessToken, null, user);
    }

    public record UserInfo(
            UUID id,
            String email,
            String displayName,
            String avatarUrl,
            User.UserType userType,
            String studentCode
    ) {}
}
