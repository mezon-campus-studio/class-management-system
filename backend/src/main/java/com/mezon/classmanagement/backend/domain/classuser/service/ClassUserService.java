package com.mezon.classmanagement.backend.domain.classuser.service;

import com.mezon.classmanagement.backend.domain.clazz.entity.Class;
import com.mezon.classmanagement.backend.domain.classuser.entity.ClassUser;
import com.mezon.classmanagement.backend.domain.auth.entity.User;
import com.mezon.classmanagement.backend.common.exeption.entity.GlobalException;
import com.mezon.classmanagement.backend.domain.classuser.repository.ClassUserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Service
public class ClassUserService {

	ClassUserRepository classUserRepository;

	@Transactional
	public ClassUser createClassUser(Long classId, Long userId, ClassUser.Role role) {
		Class clazz = Class.builder()
				.id(classId)
				.build();
		User user = User.builder()
				.id(userId)
				.build();
		ClassUser classUser = ClassUser.builder()
				.clazz(clazz)
				.user(user)
				.role(role)
				.build();

		return save(classUser);
	}

	public ClassUser save(ClassUser classUser) {
		return classUserRepository.save(classUser);
	}

	public void delete(ClassUser classUser) {
		classUserRepository.delete(classUser);
	}

	public ClassUser findByClassIdAndUserIdOrThrow(Long classId, Long userId) {
		return classUserRepository
				.findByClazz_IdAndUser_Id(classId, userId)
				.orElseThrow(() -> new GlobalException(GlobalException.Type.NOT_FOUND, "Class user not found"));
	}

	public void throwIfExistsByClassIdAndUserId(Long classId, Long userId) {
		if (existsByClassIdAndUserId(classId, userId)) {
			throw new GlobalException(GlobalException.Type.ALREADY_EXISTS, "Class user exists");
		}
	}

	public void throwIfNotExistsByClassIdAndUserId(Long classId, Long userId) {
		if (!existsByClassIdAndUserId(classId, userId)) {
			throw new GlobalException(GlobalException.Type.ALREADY_EXISTS, "Class user not found");
		}
	}

	public boolean existsByClassIdAndUserId(Long classId, Long userId) {
		return classUserRepository.existsByClazz_IdAndUser_Id(classId, userId);
	}

	public boolean isAdmin(ClassUser classUser) {
		return ClassUser.Role.CLASS_ADMIN.name().equals(classUser.getRole().name());
	}

	public void throwIfIsAdmin(ClassUser classUser) {
		if (isAdmin(classUser)) {
			throw new GlobalException(GlobalException.Type.FORBIDDEN, "Is admin");
		}
	}

	public void throwIfIsNotAdmin(ClassUser classUser) {
		if (!isAdmin(classUser)) {
			throw new GlobalException(GlobalException.Type.FORBIDDEN, "Is not admin");
		}
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