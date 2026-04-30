package com.mezon.classmanagement.backend.domain.activity.service;

import com.mezon.classmanagement.backend.common.security.annotation.RequireClassPermission;
import com.mezon.classmanagement.backend.domain.activity.dto.request.CreateAndUpdateActivityRequestDto;
import com.mezon.classmanagement.backend.domain.activity.dto.response.ActivityResponseDto;
import com.mezon.classmanagement.backend.domain.activity.entity.Activity;
import com.mezon.classmanagement.backend.domain.clazz.entity.Class;
import com.mezon.classmanagement.backend.common.exeption.entity.GlobalException;
import com.mezon.classmanagement.backend.domain.activity.mapper.ActivityMapper;
import com.mezon.classmanagement.backend.domain.activity.repository.ActivityRepository;
import com.mezon.classmanagement.backend.domain.clazz.service.ClassService;
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
	public ActivityResponseDto updateActivity(Long classId, Long activityId, CreateAndUpdateActivityRequestDto request) {
		throwIfNotExistsByClassId(classId);

		Activity currentActivity = findByIdOrThrow(activityId);

		activityMapper.updateActivityFromRequestDto(request, currentActivity);

		Activity responseActivity = save(currentActivity);

		return activityMapper.toUpdateActivityResponseDto(responseActivity);
	}

	@RequireClassPermission
	@Transactional
	public void deleteActivity(Long classId, Long activityId) {
		throwIfNotExistsByClassId(classId);

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

	/**
	 * Exists
	 */

	@Transactional
	public boolean existsByClassId(Long classId) {
		return activityRepository.existsByClazz_Id(classId);
	}

	@Transactional
	public void throwIfNotExistsByClassId(Long classId) {
		if (!existsByClassId(classId)) {
			throw new GlobalException(GlobalException.Type.NOT_FOUND, "Activity not found");
		}
	}

}