package com.mezon.classmanagement.backend.domain.classuser.classuser_request.service;

import com.mezon.classmanagement.backend.common.exeption.entity.GlobalException;
import com.mezon.classmanagement.backend.domain.auth.entity.User;
import com.mezon.classmanagement.backend.domain.classuser.classuser_request.entity.ClassUserRequest;
import com.mezon.classmanagement.backend.domain.classuser.classuser_request.repository.ClassUserRequestRepository;
import com.mezon.classmanagement.backend.domain.classuser.dto.CreateClassUserRequestDto;
import com.mezon.classmanagement.backend.domain.clazz.entity.Class;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Service
public class ClassUserRequestService {

	ClassUserRequestRepository classUserRequestRepository;

	@Transactional
	public void createClassUserRequest(
			Long classId,
			CreateClassUserRequestDto request
	) {
		throwIfExistsByClassIdAndUserIdAndStatus(classId, request.getUserId(), ClassUserRequest.Status.PENDING);

		Class clazz = Class.builder()
				.id(classId)
				.build();
		User user = User.builder()
				.id(request.getUserId())
				.build();

		ClassUserRequest newClassUserRequest = ClassUserRequest.builder()
				.clazz(clazz)
				.user(user)
				.build();

		save(newClassUserRequest);
	}

	/**
	 * Action
	 */

	@Transactional
	public ClassUserRequest save(ClassUserRequest classUserRequest) {
		return classUserRequestRepository.save(classUserRequest);
	}

	/**
	 * Exists
	 */

	@Transactional(readOnly = true)
	public boolean existsByClassIdAndUserIdAndStatus(Long classId, Long userId, ClassUserRequest.Status status) {
		return classUserRequestRepository.existsByClazz_IdAndUser_IdAndStatus(classId, userId, status);
	}

	@Transactional(readOnly = true)
	public void throwIfExistsByClassIdAndUserIdAndStatus(Long classId, Long userId, ClassUserRequest.Status status) {
		if (existsByClassIdAndUserIdAndStatus(classId, userId, status)) {
			throw new GlobalException(GlobalException.Type.ALREADY_EXISTS, "Class user request exists");
		}
	}

}