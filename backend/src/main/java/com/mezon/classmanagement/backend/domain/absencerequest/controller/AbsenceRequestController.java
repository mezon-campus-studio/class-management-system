package com.mezon.classmanagement.backend.domain.absencerequest.controller;

import com.mezon.classmanagement.backend.common.dto.ResponseDTO;
import com.mezon.classmanagement.backend.domain.absencerequest.dto.request.CreateAbsenceRequestRequestDto;
import com.mezon.classmanagement.backend.domain.absencerequest.dto.response.AbsenceRequestResponseDto;
import com.mezon.classmanagement.backend.domain.absencerequest.service.AbsenceRequestService;
import com.mezon.classmanagement.backend.domain.auth.service.AuthService;
import com.mezon.classmanagement.backend.common.security.service.JwtService;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@RequestMapping("/api/absence-requests")
@RestController
public class AbsenceRequestController {

    AbsenceRequestService service;
    AuthService authService;
    JwtService jwtService;

    @PostMapping
    public ResponseDTO<AbsenceRequestResponseDto> create(@RequestBody CreateAbsenceRequestRequestDto request) {
        Authentication authentication = authService.getAuthentication();
        Long userId = jwtService.extractUserId(authentication);

        return ResponseDTO.<AbsenceRequestResponseDto>builder()
                .success(true)
                .message("Create absence request successful")
                .data(service.create(userId, request))
                .build();
    }

    @GetMapping("/{id}")
    public ResponseDTO<AbsenceRequestResponseDto> get(@PathVariable Long id) {
        return ResponseDTO.<AbsenceRequestResponseDto>builder()
                .success(true)
                .message("Get absence request successful")
                .data(service.get(id))
                .build();
    }

    @GetMapping("/user/{userId}")
    public ResponseDTO<List<AbsenceRequestResponseDto>> listByUser(@PathVariable Long userId) {
        return ResponseDTO.<List<AbsenceRequestResponseDto>>builder()
                .success(true)
                .message("Get list successful")
                .data(service.listByUser(userId))
                .build();
    }

    @PostMapping("/{id}/approve")
    public ResponseDTO<AbsenceRequestResponseDto> approve(@PathVariable Long id) {
        return ResponseDTO.<AbsenceRequestResponseDto>builder()
                .success(true)
                .message("Approved")
                .data(service.approve(id))
                .build();
    }

    @PostMapping("/{id}/reject")
    public ResponseDTO<AbsenceRequestResponseDto> reject(@PathVariable Long id) {
        return ResponseDTO.<AbsenceRequestResponseDto>builder()
                .success(true)
                .message("Rejected")
                .data(service.reject(id))
                .build();
    }

    @DeleteMapping("/{id}")
    public ResponseDTO<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseDTO.<Void>builder()
                .success(true)
                .message("Deleted")
                .build();
    }

}
