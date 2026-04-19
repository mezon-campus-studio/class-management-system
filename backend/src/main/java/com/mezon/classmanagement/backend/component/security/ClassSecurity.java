package com.mezon.classmanagement.backend.component.security;

import com.mezon.classmanagement.backend.constant.WarningConstant;
import com.mezon.classmanagement.backend.entity.ClassUser;
import com.mezon.classmanagement.backend.exception.GlobalException;
import com.mezon.classmanagement.backend.repository.ClassUserRepository;
import com.mezon.classmanagement.backend.service.JwtService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.Optional;

@SuppressWarnings({WarningConstant.UNUSED})
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Component("classSecurity")
public class ClassSecurity {

	ClassUserRepository classUserRepository;
	JwtService jwtService;

	public boolean hasAccess(Long classId, String requiredPermission) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (!(authentication instanceof JwtAuthenticationToken)) {
			throw new GlobalException(GlobalException.Type.INVALID_AUTHENTICATION, "Invalid authentication");
		}

		Long userId = jwtService.extractUserId(authentication);
		Optional<ClassUser> classUserOptional = classUserRepository.findByClazzIdAndUserId(classId, userId);
		if (classUserOptional.isEmpty()) {
			return false;
		}

		ClassUser classUser = classUserOptional.get();
		if (ClassUser.Role.CLASS_ADMIN.name().equals(classUser.getRole().name())) {
			return true;
		}
		if (ClassUser.Role.CLASS_MEMBER.name().equals(classUser.getRole().name())) {
			return classUser.getPermissionCodes() != null && classUser.getPermissionCodes().contains(requiredPermission);
		}

		return false;
	}

}