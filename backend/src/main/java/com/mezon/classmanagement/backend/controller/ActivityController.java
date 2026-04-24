package com.mezon.classmanagement.backend.controller;

import com.mezon.classmanagement.backend.dto.activity.create.CreateActivityRequestDto;
import com.mezon.classmanagement.backend.dto.activity.create.CreateActivityResponseDto;
import com.mezon.classmanagement.backend.dto.activity.update.UpdateActivityRequestDto;
import com.mezon.classmanagement.backend.dto.ResponseDTO;
import com.mezon.classmanagement.backend.dto.activity.update.UpdateActivityResponseDto;
import com.mezon.classmanagement.backend.service.ActivityService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@RequestMapping("/api/activities")
@RestController
public class ActivityController {

	ActivityService activityService;

	@PostMapping
	public ResponseDTO<CreateActivityResponseDto> createActivity(@RequestBody CreateActivityRequestDto request) {
		CreateActivityResponseDto response = activityService.createActivity(request);

		return ResponseDTO.<CreateActivityResponseDto>builder()
				.success(true)
				.message("Create activity successful")
				.data(response)
				.build();
	}

	@PatchMapping
	public ResponseDTO<UpdateActivityResponseDto> updateActivity(@RequestBody UpdateActivityRequestDto request) {
		UpdateActivityResponseDto response = activityService.updateActivity(request);

		return ResponseDTO.<UpdateActivityResponseDto>builder()
				.success(true)
				.message("Update activity successful")
				.data(response)
				.build();
	}

	@DeleteMapping("{activityId}")
	public ResponseDTO<String> deleteActivity(@PathVariable Long activityId) {
		activityService.deleteActivity(activityId);

		return ResponseDTO.<String>builder()
				.success(true)
				.message("Delete activity successful")
				.build();
	}

}