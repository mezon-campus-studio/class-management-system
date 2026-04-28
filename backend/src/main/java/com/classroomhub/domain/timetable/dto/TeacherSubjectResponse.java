package com.classroomhub.domain.timetable.dto;

import java.util.UUID;

public record TeacherSubjectResponse(
        UUID id,
        UUID teacherId,
        String teacherName,
        String teacherEmail,
        UUID subjectId,
        String subjectName,
        String subjectCode
) {}
