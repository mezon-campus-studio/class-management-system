package com.classroomhub.domain.notification.dto;

import java.util.List;

public record UpdatePreferencesRequest(
        PreferenceEntryDto global,
        List<PreferenceEntryDto> classrooms
) {}
