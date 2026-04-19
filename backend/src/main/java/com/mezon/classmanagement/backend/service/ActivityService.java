package com.mezon.classmanagement.backend.service;

import com.mezon.classmanagement.backend.dto.request.CreateActivityRequestDto;
import com.mezon.classmanagement.backend.dto.request.UpdateActivityRequestDto;
import com.mezon.classmanagement.backend.entity.Activity;
import com.mezon.classmanagement.backend.entity.Class;
import com.mezon.classmanagement.backend.exception.GlobalException;
import com.mezon.classmanagement.backend.mapper.ActivityMapper;
import com.mezon.classmanagement.backend.repository.ActivityRepository;
import com.mezon.classmanagement.backend.repository.ClassRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Service
public class ActivityService {

	ActivityRepository activityRepository;
	ClassRepository classRepository;
	ActivityMapper activityMapper;

	@Transactional
	public void createActivity(CreateActivityRequestDto request) {
		Class clazz = classRepository
				.findById(request.getClassId())
				.orElseThrow(() -> new GlobalException(GlobalException.Type.NOT_FOUND, "Class not found"));

		Activity activity = activityMapper.toActivity(request);
		activity.setClazz(clazz);

		activityRepository.save(activity);
	}

	@Transactional
	public void updateActivity(UpdateActivityRequestDto request) {
		Class clazz = classRepository
				.findById(request.getClassId())
				.orElseThrow(() -> new GlobalException(GlobalException.Type.NOT_FOUND, "Class not found"));

		if (!activityRepository.existsById(request.getId())) {
			throw new GlobalException(GlobalException.Type.NOT_FOUND, "Activity not found");
		}

		Activity activity = activityMapper.toActivity(request);
		activity.setClazz(clazz);

		activityRepository.save(activity);
	}

	@Transactional
	public void deleteActivity(Long activityId) {
		Activity activity = activityRepository
				.findById(activityId)
				.orElseThrow(() -> new GlobalException(GlobalException.Type.NOT_FOUND, "Activity not found"));

		activityRepository.delete(activity);
	}

}