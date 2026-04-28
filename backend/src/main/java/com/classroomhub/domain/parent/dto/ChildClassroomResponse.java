package com.classroomhub.domain.parent.dto;

import java.util.UUID;

public record ChildClassroomResponse(
        UUID classroomId,
        String classroomName,
        String coverImageUrl,
        UUID studentId,
        String studentName,
        String studentCode
) {}
