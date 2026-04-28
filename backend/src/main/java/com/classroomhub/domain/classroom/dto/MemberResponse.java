package com.classroomhub.domain.classroom.dto;

import com.classroomhub.domain.classroom.entity.ClassroomMember;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

public record MemberResponse(
        UUID memberId,
        UUID userId,
        String displayName,
        String avatarUrl,
        ClassroomMember.Role role,
        Set<ClassroomMember.Role> extraRoles,
        Set<ClassroomMember.DelegatedPermission> delegatedPermissions,
        Instant joinedAt
) {}
