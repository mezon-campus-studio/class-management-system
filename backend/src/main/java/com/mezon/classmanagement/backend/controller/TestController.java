package com.mezon.classmanagement.backend.controller;

import com.mezon.classmanagement.backend.dto.response.ResponseDTO;
import com.mezon.classmanagement.backend.entity.Permission;
import com.mezon.classmanagement.backend.service.PermissionService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/test")
public class TestController {

	PermissionService permissionService;

	@GetMapping("/submit")
	@PreAuthorize("@ClassPermission.manageActivity(#classId)")
	public ResponseDTO<String> submit(@RequestHeader Long classId) {
		for (Permission p : permissionService.getPermissions()) {
			System.out.println(p.getLabel());
		}
		return ResponseDTO.<String>builder()
				.success(true)
				.message("submit")
				.build();
	}

}