package com.classroomhub.domain.notification.dto;

import java.util.List;

public record NotificationPreferencesResponse(
        PreferenceEntryDto global,
        List<PreferenceEntryDto> classrooms
) {}
