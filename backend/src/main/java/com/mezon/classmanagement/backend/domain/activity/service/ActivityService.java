package com.mezon.classmanagement.backend.domain.activity.service;

import com.mezon.classmanagement.backend.common.exeption.entity.GlobalException;
import com.mezon.classmanagement.backend.common.security.annotation.RequireClassPermission;
import com.mezon.classmanagement.backend.domain.activity.dto.request.CreateAndUpdateActivityRequestDto;
import com.mezon.classmanagement.backend.domain.activity.dto.response.ActivityIdResponseDto;
import com.mezon.classmanagement.backend.domain.activity.dto.response.ActivityResponseDto;
import com.mezon.classmanagement.backend.domain.activity.entity.Activity;
import com.mezon.classmanagement.backend.domain.activity.mapper.ActivityMapper;
import com.mezon.classmanagement.backend.domain.activity.repository.ActivityRepository;
import com.mezon.classmanagement.backend.domain.clazz.entity.Class;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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

	@RequireClassPermission
	@Transactional
	public ActivityResponseDto createActivity(Long classId, CreateAndUpdateActivityRequestDto request) {
		Class clazz = Class.builder()
				.id(classId)
				.build();

		Activity newActivity = activityMapper.toActivity(request);
		newActivity.setClazz(clazz);

		Activity responseActivity = save(newActivity);

		return activityMapper.toActivityResponseDto(responseActivity);
	}

	@RequireClassPermission
	@Transactional
	public ActivityResponseDto updateActivity(Long classId, Long activityId, CreateAndUpdateActivityRequestDto request) {
		Activity currentActivity = findByClassIdAndActivityIdOrThrow(classId, activityId);

		activityMapper.updateActivityFromRequestDto(request, currentActivity);

		Activity responseActivity = save(currentActivity);

		return activityMapper.toActivityResponseDto(responseActivity);
	}

	@RequireClassPermission
	@Transactional
	public ActivityIdResponseDto deleteActivity(Long classId, Long activityId) {
		Activity currentActivity = findByClassIdAndActivityIdOrThrow(classId, activityId);

		delete(currentActivity);

		return ActivityIdResponseDto.builder()
				.activityId(currentActivity.getId())
				.build();
	}

	@RequireClassPermission
	@Transactional(readOnly = true)
	public List<ActivityResponseDto> getActivities(Long classId) {
		return findByClassId(classId).stream()
				.map(activityMapper::toActivityResponseDto)
				.toList();
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

	@Transactional(readOnly = true)
	public List<Activity> findByClassId(Long classId) {
		return activityRepository
				.findByClazz_Id(classId);
	}

	@Transactional(readOnly = true)
	public Activity findByClassIdAndActivityIdOrThrow(Long classId, Long activityId) {
		return activityRepository
				.findByClazz_IdAndId(classId, activityId)
				.orElseThrow(() ->
						new GlobalException(GlobalException.Type.NOT_FOUND, "Activity not found")
				);
	}

}