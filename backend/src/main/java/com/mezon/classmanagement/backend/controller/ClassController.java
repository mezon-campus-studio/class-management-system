package com.mezon.classmanagement.backend.controller;

import com.fasterxml.jackson.databind.JsonSerializer;
import com.mezon.classmanagement.backend.dto.ResponseDTO;
import com.mezon.classmanagement.backend.dto.clazz.ClassDto;
import com.mezon.classmanagement.backend.dto.clazz.create.CreateClassRequestDto;
import com.mezon.classmanagement.backend.dto.joinclass.JoinClassDto;
import com.mezon.classmanagement.backend.dto.response.child.ClassMemberResponseDto;
import com.mezon.classmanagement.backend.service.AuthService;
import com.mezon.classmanagement.backend.service.ClassService;
import com.mezon.classmanagement.backend.service.JwtService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
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
	public ResponseDTO<ClassDto> createClass(@RequestBody CreateClassRequestDto request) {
		Authentication authentication = authService.getAuthentication();
		Long ownerUserId = jwtService.extractUserId(authentication);

		ClassDto response = classService.createClass(ownerUserId, request);

		return ResponseDTO.<ClassDto>builder()
				.success(true)
				.message("Class created successfully")
				.data(response)
				.build();
	}

	@PatchMapping
	public ResponseDTO<ClassDto> updateClass(@RequestBody ClassDto request) {
		ClassDto response = classService.updateClass(request);

		return ResponseDTO.<ClassDto>builder()
				.success(true)
				.message("Update class successful")
				.data(response)
				.build();
	}

	@DeleteMapping("/{classId}")
	public ResponseDTO<String> deleteClass(@PathVariable Long classId) {
		classService.deleteClass(classId);

		return ResponseDTO.<String>builder()
				.success(true)
				.message("Delete class successful")
				.build();
	}

	@PostMapping("/{classId}")
	public ResponseDTO<JoinClassDto> joinClass(@PathVariable Long classId) {
		Authentication authentication = authService.getAuthentication();
		Long userId = jwtService.extractUserId(authentication);
		JoinClassDto response = classService.joinClass(classId, userId);

		return ResponseDTO.<JoinClassDto>builder()
				.success(true)
				.message("Join class successful")
				.data(response)
				.build();
	}

	@GetMapping("{userId}")
	public ResponseDTO<String> getJoinedClasses(@PathVariable Long userId) {
		//
		return ResponseDTO.<String>builder()
				.success(true)
				.message("Get joined classes successful")
				.data(null)
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