package com.mezon.classmanagement.backend.common.security.permission;

import com.mezon.classmanagement.backend.common.constant.WarningConstant;
import com.mezon.classmanagement.backend.domain.classuser.entity.ClassUser;
import com.mezon.classmanagement.backend.domain.classuser.repository.ClassUserRepository;
import com.mezon.classmanagement.backend.domain.auth.service.AuthService;
import com.mezon.classmanagement.backend.domain.clazz.service.ClassService;
import com.mezon.classmanagement.backend.domain.classuser.service.ClassUserService;
import com.mezon.classmanagement.backend.common.security.service.JwtService;
import com.mezon.classmanagement.backend.domain.auth.service.UserService;
import com.mezon.classmanagement.backend.domain.group.service.GroupService;
import com.mezon.classmanagement.backend.domain.groupuser.entity.GroupUser;
import com.mezon.classmanagement.backend.domain.groupuser.service.GroupUserService;
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
	GroupService groupService;
	GroupUserService groupUserService;
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
		return hasClassAccess(classId, Permission.MANAGE_ACTIVITY.name());
	}

	public boolean manageGroupUser(Long classId, Long groupId) {
		return manageGroup(classId, groupId) || hasGroupAccess(classId, groupId);
	}

	public boolean manageGroup(Long classId, Long groupId) {
		return hasClassAccess(classId, Permission.MANAGE_GROUP.name());
	}

	public boolean manageFund(Long classId) {
		return hasClassAccess(classId, Permission.MANAGE_FUND.name());
	}

	public boolean managePoint(Long classId) {
		return hasClassAccess(classId, Permission.MANAGE_POINT.name());
	}

	public boolean hasGroupAccess(Long classId, Long groupId) {
		Authentication authentication = authService.getAuthentication();
		Long userId = jwtService.extractUserId(authentication);

		GroupUser groupUser = groupUserService.findByClassIdAndGroupIdAndUserIdOrThrow(classId, groupId, userId);

		return groupUserService.isLeader(groupUser);
	}

	public boolean isClassUser(Long classId) {
		Authentication authentication = authService.getAuthentication();
		Long userId = jwtService.extractUserId(authentication);

		return classUserService.existsByClassIdAndUserId(classId, userId);
	}

	public boolean hasClassAccess(Long classId, String permission) {
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