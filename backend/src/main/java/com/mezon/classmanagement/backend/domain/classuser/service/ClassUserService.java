package com.mezon.classmanagement.backend.domain.classuser.service;

import com.mezon.classmanagement.backend.common.exeption.entity.GlobalException;
import com.mezon.classmanagement.backend.common.security.annotation.RequireClassPermission;
import com.mezon.classmanagement.backend.common.security.permission.Permission;
import com.mezon.classmanagement.backend.domain.auth.entity.User;
import com.mezon.classmanagement.backend.domain.classuser.dto.ClassUserIdResponseDto;
import com.mezon.classmanagement.backend.domain.classuser.dto.ClassUserResponseDto;
import com.mezon.classmanagement.backend.domain.classuser.dto.CreateClassUserRequestDto;
import com.mezon.classmanagement.backend.domain.classuser.dto.UpdateClassUserPermissionsRequestDto;
import com.mezon.classmanagement.backend.domain.classuser.dto.UpdateClassUserRoleRequestDto;
import com.mezon.classmanagement.backend.domain.classuser.dto.UpdateClassUserSeatRequestDto;
import com.mezon.classmanagement.backend.domain.classuser.entity.ClassUser;
import com.mezon.classmanagement.backend.domain.classuser.mapper.ClassUserMapper;
import com.mezon.classmanagement.backend.domain.classuser.repository.ClassUserRepository;
import com.mezon.classmanagement.backend.domain.clazz.entity.Class;
import com.mezon.classmanagement.backend.domain.clazz.repository.ClassRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Service
public class ClassUserService {

	/**
	 * Repository
	 */

	ClassRepository classRepository;
	ClassUserRepository classUserRepository;

	/**
	 * Mapper
	 */

	ClassUserMapper classUserMapper;

	@RequireClassPermission
	@Transactional
	public ClassUserResponseDto createClassUser(Long classId, CreateClassUserRequestDto request, ClassUser.Role role) {
		throwIfExistsByClassIdAndUserId(classId, request.getUserId());

		Class clazz = Class.builder()
				.id(classId)
				.build();
		User user = User.builder()
				.id(request.getUserId())
				.build();

		ClassUser newClassUser = ClassUser.builder()
				.clazz(clazz)
				.user(user)
				.role(role)
				.build();

		ClassUser responseClassUser = save(newClassUser);

		return classUserMapper.toClassUserResponseDto(responseClassUser);
	}

	@RequireClassPermission
	@Transactional
	public ClassUserResponseDto updateClassUserSeat(Long classId, Long userId, UpdateClassUserSeatRequestDto request) {
		ClassUser currentClassUser = findByClassIdAndUserIdOrThrow(classId, userId);

		classUserMapper.updateClassUserFromSeatRequestDto(request, currentClassUser);

		ClassUser responseClassUser = save(currentClassUser);

		return classUserMapper.toClassUserResponseDto(responseClassUser);
	}

	@RequireClassPermission
	@Transactional
	public ClassUserResponseDto updateClassUserRole(Long classId, Long userId, UpdateClassUserRoleRequestDto request) {
		ClassUser currentClassUser = findByClassIdAndUserIdOrThrow(classId, userId);

		classUserMapper.updateClassUserFromRoleRequestDto(request, currentClassUser);

		ClassUser responseClassUser = save(currentClassUser);

		return classUserMapper.toClassUserResponseDto(responseClassUser);
	}

	@RequireClassPermission
	@Transactional
	public ClassUserResponseDto updateClassUserPermissions(Long classId, Long userId, UpdateClassUserPermissionsRequestDto request) {
		ClassUser currentClassUser = findByClassIdAndUserIdOrThrow(classId, userId);

		classUserMapper.updateClassUserFromPermissionsRequestDto(request, currentClassUser);

		ClassUser responseClassUser = save(currentClassUser);

		return classUserMapper.toClassUserResponseDto(responseClassUser);
	}

	@RequireClassPermission
	@Transactional
	public ClassUserIdResponseDto deleteClassUser(Long classId, Long userId) {
		ClassUser currentClassUser = findByClassIdAndUserIdOrThrow(classId, userId);

		delete(currentClassUser);

		return ClassUserIdResponseDto.builder()
				.classUserId(currentClassUser.getId())
				.build();
	}

	@RequireClassPermission
	@Transactional(readOnly = true)
	public List<ClassUserResponseDto> getClassUsers(Long classId, String status) {

		return classUserRepository.getClassUsers(classId);
	}

	/**
	 * Action
	 */

	@Transactional
	public ClassUser save(ClassUser classUser) {
		return classUserRepository.save(classUser);
	}

	@Transactional
	public void delete(ClassUser classUser) {
		classUserRepository.delete(classUser);
	}

	@Transactional(readOnly = true)
	public ClassUser findByClassIdAndUserIdOrThrow(Long classId, Long userId) {
		return classUserRepository
				.findByClazz_IdAndUser_Id(classId, userId)
				.orElseThrow(() -> new GlobalException(GlobalException.Type.NOT_FOUND, "Class user not found"));
	}

	/**
	 * Exists
	 */

	@Transactional(readOnly = true)
	public boolean existsByClassIdAndUserId(Long classId, Long userId) {
		return classUserRepository.existsByClazz_IdAndUser_Id(classId, userId);
	}

	@Transactional(readOnly = true)
	public void throwIfExistsByClassIdAndUserId(Long classId, Long userId) {
		if (existsByClassIdAndUserId(classId, userId)) {
			throw new GlobalException(GlobalException.Type.ALREADY_EXISTS, "Class user exists");
		}
	}

	/**
	 * Validate
	 */

	public boolean isAdmin(ClassUser classUser) {
		return ClassUser.Role.CLASS_ADMIN.name().equals(classUser.getRole().name());
	}

	public boolean isMember(ClassUser classUser) {
		return ClassUser.Role.CLASS_MEMBER.name().equals(classUser.getRole().name());
	}

	public boolean hasPermission(ClassUser classUser, Permission permission) {
		return classUser.getPermissionCodes() != null && classUser.getPermissionCodes().contains(permission);
	}

}