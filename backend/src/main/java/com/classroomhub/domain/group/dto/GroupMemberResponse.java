package com.classroomhub.domain.group.dto;

import java.time.Instant;
import java.util.UUID;

public record GroupMemberResponse(
        UUID groupMemberId,
        UUID userId,
        String displayName,
        String avatarUrl,
        Instant joinedAt
) {}
