package com.classroomhub.domain.seating.controller;

import com.classroomhub.common.response.ApiResponse;
import com.classroomhub.common.security.SecurityUtils;
import com.classroomhub.domain.seating.dto.SeatingResponse;
import com.classroomhub.domain.seating.dto.UpdateSeatingRequest;
import com.classroomhub.domain.seating.service.SeatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/classrooms/{classroomId}/seating")
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class SeatingController {

    private final SeatingService seatingService;

    @GetMapping
    public ApiResponse<SeatingResponse> getSeating(@PathVariable UUID classroomId) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(seatingService.getSeating(classroomId, userId));
    }

    @PutMapping
    public ApiResponse<SeatingResponse> updateSeating(
            @PathVariable UUID classroomId,
            @RequestBody UpdateSeatingRequest req) {
        UUID userId = SecurityUtils.getCurrentUser().getId();
        return ApiResponse.ok(seatingService.updateSeating(classroomId, userId, req), "Đã cập nhật sơ đồ");
    }
}
