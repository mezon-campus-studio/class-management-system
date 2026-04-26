package com.mezon.classmanagement.backend.controller;

import com.mezon.classmanagement.backend.dto.ResponseDTO;
import com.mezon.classmanagement.backend.dto.clazz.ClassDto;
import com.mezon.classmanagement.backend.dto.clazz.join.JoinClassRequestDto;
import com.mezon.classmanagement.backend.dto.clazz.classid.ClassIdResponseDto;
import com.mezon.classmanagement.backend.dto.clazz.createandupdate.CreateAndUpdateClassRequestDto;
import com.mezon.classmanagement.backend.dto.classmember.ClassMemberResponseDto;
import com.mezon.classmanagement.backend.service.AuthService;
import com.mezon.classmanagement.backend.service.ClassService;
import com.mezon.classmanagement.backend.service.JwtService;
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
	public ResponseDTO<ClassDto> createClass(@RequestBody CreateAndUpdateClassRequestDto request) {
		Authentication authentication = authService.getAuthentication();
		Long ownerUserId = jwtService.extractUserId(authentication);

		ClassDto response = classService.createClass(ownerUserId, request);

		return ResponseDTO.<ClassDto>builder()
				.success(true)
				.message("Create class successful")
				.data(response)
				.build();
	}

	@PreAuthorize("@ClassPermission.adminOnly(#classId)")
	@PatchMapping("/{classId}")
	public ResponseDTO<ClassDto> updateClass(
			@PathVariable Long classId,
			@RequestBody CreateAndUpdateClassRequestDto request
	) {
		ClassDto response = classService.updateClass(classId, request);

		return ResponseDTO.<ClassDto>builder()
				.success(true)
				.message("Update class successful")
				.data(response)
				.build();
	}

	@PreAuthorize("@ClassPermission.adminOnly(#classId)")
	@DeleteMapping("/{classId}")
	public ResponseDTO<ClassIdResponseDto> deleteClass(@PathVariable Long classId) {
		classService.deleteClass(classId);

		return ResponseDTO.<ClassIdResponseDto>builder()
				.success(true)
				.message("Delete class successful")
				.data(ClassIdResponseDto.builder().classId(classId).build())
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
	public ResponseDTO<List<ClassDto>> getJoinedClasses() {
		Authentication authentication = authService.getAuthentication();
		Long currentUserId = jwtService.extractUserId(authentication);

		List<ClassDto> response = classService.getJoinedClasses(currentUserId);

		return ResponseDTO.<List<ClassDto>>builder()
				.success(true)
				.message("Get joined classes successful")
				.data(response)
				.build();
	}

	@GetMapping("/{classId}/members")
	public ResponseDTO<List<ClassMemberResponseDto>> getClassMembers(@PathVariable Long classId) {
		return ResponseDTO.<List<ClassMemberResponseDto>>builder()
				.success(true)
				.message("Class members founds")
				.data(classService.getClassMembers(classId))
				.build();
	}

}