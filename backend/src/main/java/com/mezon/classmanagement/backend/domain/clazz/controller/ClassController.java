package com.mezon.classmanagement.backend.domain.clazz.controller;

import com.mezon.classmanagement.backend.common.dto.ResponseDTO;
import com.mezon.classmanagement.backend.common.security.service.JwtService;
import com.mezon.classmanagement.backend.domain.auth.service.AuthService;
import com.mezon.classmanagement.backend.domain.classuser.dto.ClassUserResponseDto;
import com.mezon.classmanagement.backend.domain.classuser.dto.CreateClassUserRequestDto;
import com.mezon.classmanagement.backend.domain.clazz.dto.ClassResponseDto;
import com.mezon.classmanagement.backend.domain.clazz.dto.classid.ClassIdResponseDto;
import com.mezon.classmanagement.backend.domain.clazz.dto.createandupdate.CreateAndUpdateClassRequestDto;
import com.mezon.classmanagement.backend.domain.clazz.dto.join.JoinClassRequestDto;
import com.mezon.classmanagement.backend.domain.clazz.service.ClassService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@RequestMapping("/api/classes")
@RestController
public class ClassController {

	ClassService classService;
	AuthService authService;
	JwtService jwtService;

	@PostMapping
	public ResponseDTO<ClassResponseDto> createClass(
			@RequestBody CreateAndUpdateClassRequestDto request
	) {
		Authentication authentication = authService.getAuthentication();
		Long clientUserId = jwtService.extractUserId(authentication);

		ClassResponseDto response = classService.createClass(clientUserId, request);

		return ResponseDTO.<ClassResponseDto>builder()
				.success(true)
				.message("Create class successful")
				.data(response)
				.build();
	}

	@PreAuthorize("@ClassPermission.adminOnly(#classId)")
	@PatchMapping("/{classId}")
	public ResponseDTO<ClassResponseDto> updateClass(
			@PathVariable Long classId,
			@RequestBody CreateAndUpdateClassRequestDto request
	) {
		ClassResponseDto response = classService.updateClass(classId, request);

		return ResponseDTO.<ClassResponseDto>builder()
				.success(true)
				.message("Update class successful")
				.data(response)
				.build();
	}

	@PreAuthorize("@ClassPermission.adminOnly(#classId)")
	@DeleteMapping("/{classId}")
	public ResponseDTO<ClassIdResponseDto> deleteClass(
			@PathVariable Long classId
	) {
		ClassIdResponseDto response = classService.deleteClass(classId);

		return ResponseDTO.<ClassIdResponseDto>builder()
				.success(true)
				.message("Delete class successful")
				.data(response)
				.build();
	}

	@PreAuthorize("@ClassPermission.adminOnly(#classId)")
	@PostMapping("/{classId}/members")
	public ResponseDTO<ClassUserResponseDto> addClassMember(
			@PathVariable Long classId,
			@RequestBody CreateClassUserRequestDto request
	) {
		ClassUserResponseDto response = classService.addMemberClassUser(classId, request);

		return ResponseDTO.<ClassUserResponseDto>builder()
				.success(true)
				.message("Create class user successful")
				.data(response)
				.build();
	}

	@PostMapping("/join")
	public ResponseDTO<ClassIdResponseDto> joinClass(
			@RequestBody JoinClassRequestDto request
	) {
		Authentication authentication = authService.getAuthentication();
		Long userId = jwtService.extractUserId(authentication);

		ClassIdResponseDto response = classService.joinClass(userId, request);

		return ResponseDTO.<ClassIdResponseDto>builder()
				.success(true)
				.message("Join class successful")
				.data(response)
				.build();
	}

	@PreAuthorize("@ClassPermission.exceptAdmin(#classId)")
	@DeleteMapping("/{classId}/leave")
	public ResponseDTO<ClassIdResponseDto> leaveClass(
			@PathVariable Long classId
	) {
		Authentication authentication = authService.getAuthentication();
		Long userId = jwtService.extractUserId(authentication);

		ClassIdResponseDto response = classService.leaveClass(userId, classId);

		return ResponseDTO.<ClassIdResponseDto>builder()
				.success(true)
				.message("Leave class successful")
				.data(response)
				.build();
	}

	@GetMapping
	public ResponseDTO<List<ClassResponseDto>> getJoinedClasses() {
		Authentication authentication = authService.getAuthentication();
		Long currentUserId = jwtService.extractUserId(authentication);

		List<ClassResponseDto> response = classService.getJoinedClasses(currentUserId);

		return ResponseDTO.<List<ClassResponseDto>>builder()
				.success(true)
				.message("Get joined classes successful")
				.data(response)
				.build();
	}

}