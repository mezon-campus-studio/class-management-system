package com.classroomhub.domain.notification.controller;

import com.classroomhub.common.response.ApiResponse;
import com.classroomhub.common.security.SecurityUtils;
import com.classroomhub.domain.notification.dto.NotificationPreferencesResponse;
import com.classroomhub.domain.notification.dto.UpdatePreferencesRequest;
import com.classroomhub.domain.notification.service.NotificationPreferenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications/preferences")
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class NotificationPreferenceController {

    private final NotificationPreferenceService preferenceService;

    @GetMapping
    public ApiResponse<NotificationPreferencesResponse> getPreferences() {
        return ApiResponse.ok(preferenceService.getPreferences(SecurityUtils.getCurrentUser().getId()));
    }

    @PutMapping
    public ApiResponse<NotificationPreferencesResponse> updatePreferences(
            @RequestBody UpdatePreferencesRequest req) {
        return ApiResponse.ok(preferenceService.updatePreferences(SecurityUtils.getCurrentUser().getId(), req));
    }
}
