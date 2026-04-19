package com.mezon.classmanagement.backend.controller;

import com.mezon.classmanagement.backend.dto.request.CreateActivityRequestDto;
import com.mezon.classmanagement.backend.dto.request.UpdateActivityRequestDto;
import com.mezon.classmanagement.backend.dto.response.ResponseDTO;
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
	public ResponseDTO<String> createActivity(@RequestBody CreateActivityRequestDto request) {
		activityService.createActivity(request);

		return ResponseDTO.<String>builder()
				.success(true)
				.message("Create activity successful")
				.build();
	}

	@PatchMapping
	public ResponseDTO<String> updateActivity(@RequestBody UpdateActivityRequestDto request) {
		activityService.updateActivity(request);

		return ResponseDTO.<String>builder()
				.success(true)
				.message("Update activity successful")
				.build();
	}

	@DeleteMapping("{activityId}")
	public ResponseDTO<String> createActivity(@PathVariable Long activityId) {
		activityService.deleteActivity(activityId);

		return ResponseDTO.<String>builder()
				.success(true)
				.message("Delete activity successful")
				.build();
	}

}