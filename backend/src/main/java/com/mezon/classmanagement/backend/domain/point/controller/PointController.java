package com.mezon.classmanagement.backend.domain.point.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mezon.classmanagement.backend.common.dto.ResponseDTO;
import com.mezon.classmanagement.backend.common.security.service.JwtService;
import com.mezon.classmanagement.backend.domain.auth.service.AuthService;
import com.mezon.classmanagement.backend.domain.point.dto.CreatePointRequestDto;
import com.mezon.classmanagement.backend.domain.point.dto.GetPointRequestDto;
import com.mezon.classmanagement.backend.domain.point.dto.MonthPointRankingResponseDto;
import com.mezon.classmanagement.backend.domain.point.dto.PointIdResponseDto;
import com.mezon.classmanagement.backend.domain.point.dto.PointResponseDto;
import com.mezon.classmanagement.backend.domain.point.dto.WeekPointRankingResponseDto;
import com.mezon.classmanagement.backend.domain.point.service.PointService;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@RequestMapping("/api/classes/{classId}/points")
@RestController
public class PointController {

	AuthService authService;
	JwtService jwtService;

	PointService pointService;

	@PreAuthorize("@ClassPermission.everyoneInClass(#classId)")
	@PostMapping("/groups/{groupId}")
	public ResponseDTO<PointResponseDto> create(
			@PathVariable Long classId,
			@PathVariable Long groupId,
			@RequestBody CreatePointRequestDto request
	) {
		Authentication authentication = authService.getAuthentication();
		Long userId = jwtService.extractUserId(authentication);

		PointResponseDto response = pointService.create(classId, groupId, userId, request);

		return ResponseDTO.<PointResponseDto>builder()
				.success(true)
				.message("Create point successful")
				.data(response)
				.build();
	}

	@PreAuthorize("@ClassPermission.everyoneInClass(#classId)")
	@DeleteMapping("/{pointId}")
	public ResponseDTO<PointIdResponseDto> delete(
			@PathVariable Long classId,
			@PathVariable Long pointId
	) {
		PointIdResponseDto response = pointService.delete(classId, pointId);

		return ResponseDTO.<PointIdResponseDto>builder()
				.success(true)
				.message("Delete point successful")
				.data(response)
				.build();
	}

	@PreAuthorize("@ClassPermission.everyoneInClass(#classId)")
	@GetMapping
	public ResponseDTO<List<PointResponseDto>> getByClass(
			@PathVariable Long classId,
			// @Valid @RequestBody(required = false) GetPointRequestDto request
			@ModelAttribute GetPointRequestDto request
	) {
		List<PointResponseDto> response = pointService.getByClass(classId, request);

		return ResponseDTO.<List<PointResponseDto>>builder()
				.success(true)
				.message("Get points by class successful")
				.data(response)
				.build();
	}

	@PreAuthorize("@ClassPermission.everyoneInClass(#classId)")
	@GetMapping("/groups/{groupId}")
	public ResponseDTO<List<PointResponseDto>> getByGroup(
			@PathVariable Long classId,
			@PathVariable Long groupId,
			@Valid @RequestBody(required = false) GetPointRequestDto request
	) {
		List<PointResponseDto> response = pointService.getByGroup(classId, groupId, request);

		return ResponseDTO.<List<PointResponseDto>>builder()
				.success(true)
				.message("Get points by class successful")
				.data(response)
				.build();
	}

	@PreAuthorize("@ClassPermission.everyoneInClass(#classId)")
	@GetMapping("/week-ranking")
	public ResponseDTO<List<WeekPointRankingResponseDto>> getWeekRanking(
			@PathVariable Long classId
	) {
		List<WeekPointRankingResponseDto> response = pointService.getWeekRanking(classId);

		return ResponseDTO.<List<WeekPointRankingResponseDto>>builder()
				.success(true)
				.message("Get week point ranking successful")
				.data(response)
				.build();
	}

	@PreAuthorize("@ClassPermission.everyoneInClass(#classId)")
	@GetMapping("/month-ranking")
	public ResponseDTO<List<MonthPointRankingResponseDto>> getMonthRanking(
			@PathVariable Long classId
	) {
		List<MonthPointRankingResponseDto> response = pointService.getMonthRanking(classId);

		return ResponseDTO.<List<MonthPointRankingResponseDto>>builder()
				.success(true)
				.message("Get month point ranking successful")
				.data(response)
				.build();
	}

}