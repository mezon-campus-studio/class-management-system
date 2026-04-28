package com.classroomhub.domain.notification.dto;

import com.classroomhub.domain.notification.entity.NotificationPreference;

import java.util.UUID;

public record PreferenceEntryDto(
        UUID classroomId,
        NotificationPreference.ChatLevel chatLevel,
        boolean dutyEnabled,
        boolean eventEnabled,
        boolean attendanceEnabled,
        boolean fundEnabled,
        boolean evaluationEnabled
) {}
