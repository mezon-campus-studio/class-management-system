package com.classroomhub.domain.parent.dto;

import java.util.UUID;

public record ParentClassroomDetailResponse(
        UUID classroomId,
        String name,
        String description,
        String coverImageUrl,
        UUID studentId,
        String studentName,
        String studentCode
) {}
