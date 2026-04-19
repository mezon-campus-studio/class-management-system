package com.mezon.classmanagement.backend.component.security;

import com.mezon.classmanagement.backend.constant.WarningConstant;
import com.mezon.classmanagement.backend.entity.ClassUser;
import com.mezon.classmanagement.backend.entity.Permission;
import com.mezon.classmanagement.backend.repository.ClassUserRepository;
import com.mezon.classmanagement.backend.service.AuthService;
import com.mezon.classmanagement.backend.service.ClassUserService;
import com.mezon.classmanagement.backend.service.JwtService;
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
	ClassUserService classUserService;
	JwtService jwtService;

	public boolean adminOnly(Long classId) {
		Authentication authentication = authService.getAuthentication();
		Long userId = jwtService.extractUserId(authentication);
		ClassUser classUser = classUserService.findByClassIdAndUserId(classId, userId);

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

	private boolean hasAccess(Long classId, String permission) {
		Authentication authentication = authService.getAuthentication();
		Long userId = jwtService.extractUserId(authentication);
		ClassUser classUser = classUserService.findByClassIdAndUserId(classId, userId);

		if (classUserService.isAdmin(classUser)) {
			return true;
		}
		if (classUserService.isMember(classUser)) {
			return classUserService.hasPermission(classUser, permission);
		}

		return false;
	}

}