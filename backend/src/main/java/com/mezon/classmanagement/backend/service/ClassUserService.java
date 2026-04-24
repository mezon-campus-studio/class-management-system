package com.mezon.classmanagement.backend.service;

import com.mezon.classmanagement.backend.entity.ClassUser;
import com.mezon.classmanagement.backend.exception.GlobalException;
import com.mezon.classmanagement.backend.repository.ClassUserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Service
public class ClassUserService {

	ClassUserRepository classUserRepository;

	public ClassUser findByClassIdAndUserId(Long classId, Long userId) {
		return classUserRepository
				.findByClazz_IdAndUser_Id(classId, userId)
				.orElseThrow(() -> new GlobalException(GlobalException.Type.NOT_FOUND, "Class user not found"));
	}

	public boolean isAdmin(ClassUser classUser) {
		return ClassUser.Role.CLASS_ADMIN.name().equals(classUser.getRole().name());
	}

	public boolean isMember(ClassUser classUser) {
		return ClassUser.Role.CLASS_MEMBER.name().equals(classUser.getRole().name());
	}

	public boolean isClassUser(Long classId, Long userId) {
		return classUserRepository.existsByClazz_IdAndUser_Id(classId, userId);
	}

	public boolean hasPermission(ClassUser classUser, String permission) {
		return classUser.getPermissionCodes() != null && classUser.getPermissionCodes().contains(permission);
	}

}