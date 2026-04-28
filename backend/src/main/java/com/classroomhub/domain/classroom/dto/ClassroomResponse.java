package com.classroomhub.domain.classroom.dto;

import com.classroomhub.domain.classroom.entity.Classroom;
import com.classroomhub.domain.classroom.entity.ClassroomMember;

import java.time.Instant;
import java.util.UUID;

public record ClassroomResponse(
        UUID id,
        String name,
        String description,
        String coverImageUrl,
        String inviteCode,
        Instant inviteCodeExpiresAt,
        UUID ownerId,
        int maxMembers,
        int memberCount,
        Classroom.Status status,
        ClassroomMember.Role myRole,
        Instant createdAt
) {
    public static ClassroomResponse from(Classroom c, int memberCount, ClassroomMember.Role myRole) {
        return new ClassroomResponse(
                c.getId(), c.getName(), c.getDescription(), c.getCoverImageUrl(),
                c.getInviteCode(), c.getInviteCodeExpiresAt(), c.getOwnerId(),
                c.getMaxMembers(), memberCount, c.getStatus(), myRole, c.getCreatedAt()
        );
    }
}
