package com.classroomhub.domain.timetable.dto;

import java.util.List;

public record GenerateTimetableResponse(
        List<TimetableEntryResponse> entries,
        List<String> conflicts
) {}
