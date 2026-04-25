package com.mezon.classmanagement.backend.component.security;

import com.mezon.classmanagement.backend.constant.WarningConstant;
import com.mezon.classmanagement.backend.entity.ClassUser;
import com.mezon.classmanagement.backend.entity.Permission;
import com.mezon.classmanagement.backend.exception.GlobalException;
import com.mezon.classmanagement.backend.repository.ClassUserRepository;
import com.mezon.classmanagement.backend.service.AuthService;
import com.mezon.classmanagement.backend.service.ClassService;
import com.mezon.classmanagement.backend.service.ClassUserService;
import com.mezon.classmanagement.backend.service.JwtService;
import com.mezon.classmanagement.backend.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@SuppressWarnings({WarningConstant.UNUSED})
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Component("ClassPermission")
public class ClassPermission {

	ClassUserRepository classUserRepository;
	AuthService authService;
	ClassService classService;
	UserService userService;
	ClassUserService classUserService;
	JwtService jwtService;

	public boolean adminOnly(Long classId) {
		classService.throwIfNotExistsById(classId);

		Authentication authentication = authService.getAuthentication();
		Long userId = jwtService.extractUserId(authentication);

		userService.throwIfNotExistsById(userId);

		ClassUser classUser = classUserService.findByClassIdAndUserIdOrThrow(classId, userId);

		return classUserService.isAdmin(classUser);
	}

	public boolean manageActivity(Long classId) {
		return hasAccess(classId, Permission.MANAGE_ACTIVITY.name());
	}

	public boolean manageFund(Long classId) {
		return hasAccess(classId, Permission.MANAGE_FUND.name());
	}

	public boolean managePoint(Long classId) {
		return hasAccess(classId, Permission.MANAGE_POINT.name());
	}

	public boolean hasAccess(Long classId, String permission) {
		classService.throwIfNotExistsById(classId);

		Authentication authentication = authService.getAuthentication();
		Long userId = jwtService.extractUserId(authentication);

		userService.throwIfNotExistsById(userId);

		ClassUser classUser = classUserService.findByClassIdAndUserIdOrThrow(classId, userId);

		if (classUserService.isAdmin(classUser)) {
			return true;
		}
		if (classUserService.isMember(classUser)) {
			return classUserService.hasPermission(classUser, permission);
		}

		return false;
	}

}