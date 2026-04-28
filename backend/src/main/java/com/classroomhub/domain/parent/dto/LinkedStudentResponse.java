package com.classroomhub.domain.parent.dto;

import com.classroomhub.domain.parent.entity.ParentLink;

import java.time.Instant;
import java.util.UUID;

public record LinkedStudentResponse(
        UUID linkId,
        UUID studentId,
        String studentName,
        String studentEmail,
        String studentCode,
        String avatarUrl,
        String relationship,
        Instant linkedAt
) {
    public static LinkedStudentResponse of(
            ParentLink link, String name, String email, String code, String avatar) {
        return new LinkedStudentResponse(
                link.getId(), link.getStudentId(),
                name, email, code, avatar,
                link.getRelationship(), link.getCreatedAt());
    }
}
