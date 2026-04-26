package com.mezon.classmanagement.backend.service;

import com.mezon.classmanagement.backend.annotation.RequireClassPermission;
import com.mezon.classmanagement.backend.dto.activity.request.CreateAndUpdateActivityRequestDto;
import com.mezon.classmanagement.backend.dto.activity.response.ActivityResponseDto;
import com.mezon.classmanagement.backend.entity.Activity;
import com.mezon.classmanagement.backend.entity.Class;
import com.mezon.classmanagement.backend.exception.GlobalException;
import com.mezon.classmanagement.backend.mapper.ActivityMapper;
import com.mezon.classmanagement.backend.repository.ActivityRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Service
public class ActivityService {

	/**
	 * Repository
	 */

	ActivityRepository activityRepository;

	/**
	 * Mapper
	 */

	ActivityMapper activityMapper;

	/**
	 * Other services
	 */

	ClassService classService;

	@Transactional
	public ActivityResponseDto createActivity(Long classId, CreateAndUpdateActivityRequestDto request) {
		classService.throwIfNotExistsById(classId);

		Class clazz = Class.builder()
				.id(classId)
				.build();
		Activity newActivity = activityMapper.toActivity(request);
		newActivity.setClazz(clazz);

		Activity responseActivity = save(newActivity);

		return activityMapper.toCreateActivityResponseDto(responseActivity);
	}

	@RequireClassPermission
	@Transactional
	public ActivityResponseDto updateActivity(Long activityId, CreateAndUpdateActivityRequestDto request) {
		Activity currentActivity = findByIdOrThrow(activityId);

		activityMapper.updateActivityFromRequestDto(request, currentActivity);

		Activity responseActivity = save(currentActivity);

		return activityMapper.toUpdateActivityResponseDto(responseActivity);
	}

	@RequireClassPermission
	@Transactional
	public void deleteActivity(Long activityId) {
		Activity currentActivity = findByIdOrThrow(activityId);

		delete(currentActivity);
	}

	/**
	 * Action
	 */

	@Transactional
	public Activity save(Activity activity) {
		return activityRepository.save(activity);
	}

	@Transactional
	public void delete(Activity activity) {
		activityRepository.delete(activity);
	}

	/**
	 * Find
	 */

	@Transactional
	public Activity findByIdOrThrow(Long id) {
		return activityRepository
				.findById(id)
				.orElseThrow(() ->
						new GlobalException(GlobalException.Type.NOT_FOUND, "Activity not found")
				);
	}

}