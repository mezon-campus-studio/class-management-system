package com.classroomhub.domain.admin.dto;

import com.classroomhub.domain.classroom.entity.Classroom;

import java.time.Instant;
import java.util.UUID;

public record AdminClassroomResponse(
        UUID id,
        String name,
        String description,
        UUID ownerId,
        String ownerName,
        int memberCount,
        int maxMembers,
        Classroom.Status status,
        Instant createdAt
) {}
