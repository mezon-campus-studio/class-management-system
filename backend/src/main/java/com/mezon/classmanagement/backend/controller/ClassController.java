package com.mezon.classmanagement.backend.controller;

import com.mezon.classmanagement.backend.dto.response.child.ClassMemberResponseDto;
import com.mezon.classmanagement.backend.dto.response.ResponseDTO;
import com.mezon.classmanagement.backend.service.ClassService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/classes")
public class ClassController {

	ClassService classService;

	@PostMapping
	public ResponseDTO<String> createClass() {
		return ResponseDTO.<String>builder()
				.success(true)
				.message("Class created successfully")
				.data(null)
				.build();
	}

	@PatchMapping("/{classId}")
	public ResponseDTO<String> updateClass(
			@PathVariable Long classId
	) {
		return ResponseDTO.<String>builder()
				.success(true)
				.message("Class updated successfully")
				.data(null)
				.build();
	}

	@DeleteMapping("/{classId}")
	public ResponseDTO<String> deleteClass(
			@PathVariable Long classId
	) {
		return ResponseDTO.<String>builder()
				.success(true)
				.message("Class deleted successfully")
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