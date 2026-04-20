package com.mezon.classmanagement.backend.service;

import com.mezon.classmanagement.backend.dto.activity.create.CreateActivityRequestDto;
import com.mezon.classmanagement.backend.dto.activity.create.CreateActivityResponseDto;
import com.mezon.classmanagement.backend.dto.activity.update.UpdateActivityRequestDto;
import com.mezon.classmanagement.backend.dto.activity.update.UpdateActivityResponseDto;
import com.mezon.classmanagement.backend.entity.Activity;
import com.mezon.classmanagement.backend.entity.Class;
import com.mezon.classmanagement.backend.exception.GlobalException;
import com.mezon.classmanagement.backend.mapper.ActivityMapper;
import com.mezon.classmanagement.backend.repository.ActivityRepository;
import com.mezon.classmanagement.backend.repository.ClassRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Service
public class ActivityService {

	ActivityRepository activityRepository;
	ClassRepository classRepository;
	ActivityMapper activityMapper;

	@Transactional
	public CreateActivityResponseDto createActivity(CreateActivityRequestDto request) {
		Class currentClass = classRepository
				.findById(request.getClassId())
				.orElseThrow(() -> new GlobalException(GlobalException.Type.NOT_FOUND, "Class not found"));

		Activity insertedActivity = activityMapper.toActivity(request);
		insertedActivity.setClazz(currentClass);

		Activity responseActivity = activityRepository.save(insertedActivity);

		return activityMapper.toCreateActivityResponseDto(responseActivity);
	}

	@Transactional
	public UpdateActivityResponseDto updateActivity(UpdateActivityRequestDto request) {
		Activity currentActivity = activityRepository
				.findById(request.getId())
				.orElseThrow(() -> new GlobalException(GlobalException.Type.NOT_FOUND, "Activity not found"));

		Class currentClass = classRepository
				.findById(currentActivity.getClazz().getId())
				.orElseThrow(() -> new GlobalException(GlobalException.Type.NOT_FOUND, "Class not found"));

		Activity updatedActivity = activityMapper.toActivity(request);
		updatedActivity.setClazz(currentClass);

		Activity responseActivity = activityRepository.save(updatedActivity);

		return activityMapper.toUpdateActivityResponseDto(responseActivity);
	}

	@Transactional
	public void deleteActivity(Long activityId) {
		Activity activity = activityRepository
				.findById(activityId)
				.orElseThrow(() -> new GlobalException(GlobalException.Type.NOT_FOUND, "Activity not found"));

		activityRepository.delete(activity);
	}

}