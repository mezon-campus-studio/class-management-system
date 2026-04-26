package com.mezon.classmanagement.backend.controller;

import com.mezon.classmanagement.backend.constant.WarningConstant;
import com.mezon.classmanagement.backend.dto.ResponseDTO;
import com.mezon.classmanagement.backend.dto.activity.response.ActivityIdResponseDto;
import com.mezon.classmanagement.backend.dto.activity.response.ActivityResponseDto;
import com.mezon.classmanagement.backend.dto.activity.request.CreateAndUpdateActivityRequestDto;
import com.mezon.classmanagement.backend.service.ActivityService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@RequestMapping("/api/{classId}/activities")
@RestController
public class ActivityController {

	ActivityService activityService;

	@PostMapping
	public ResponseDTO<ActivityResponseDto> createActivity(
			@PathVariable Long classId,
			@RequestBody CreateAndUpdateActivityRequestDto request
	) {
		ActivityResponseDto response = activityService.createActivity(classId, request);

		return ResponseDTO.<ActivityResponseDto>builder()
				.success(true)
				.message("Create activity successful")
				.data(response)
				.build();
	}

	@SuppressWarnings({WarningConstant.UNUSED})
	@PreAuthorize("@ClassPermission.manageActivity(#classId)")
	@PatchMapping("/{activityId}")
	public ResponseDTO<ActivityResponseDto> updateActivity(
			@PathVariable Long classId,
			@PathVariable Long activityId,
			@RequestBody CreateAndUpdateActivityRequestDto request
	) {
		ActivityResponseDto response = activityService.updateActivity(activityId, request);

		return ResponseDTO.<ActivityResponseDto>builder()
				.success(true)
				.message("Update activity successful")
				.data(response)
				.build();
	}

	@SuppressWarnings({WarningConstant.UNUSED})
	@PreAuthorize("@ClassPermission.manageActivity(#classId)")
	@DeleteMapping("{activityId}")
	public ResponseDTO<ActivityIdResponseDto> deleteActivity(
			@PathVariable Long classId,
			@PathVariable Long activityId
	) {
		activityService.deleteActivity(activityId);

		return ResponseDTO.<ActivityIdResponseDto>builder()
				.success(true)
				.message("Delete activity successful")
				.data(ActivityIdResponseDto.builder().activityId(activityId).build())
				.build();
	}

}