package com.mezon.classmanagement.backend.controller;

import com.mezon.classmanagement.backend.dto.response.CreateClassRequestDto;
import com.mezon.classmanagement.backend.dto.response.UpdateClassRequestDto;
import com.mezon.classmanagement.backend.dto.response.child.ClassMemberResponseDto;
import com.mezon.classmanagement.backend.dto.response.ResponseDTO;
import com.mezon.classmanagement.backend.service.ClassService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@RequestMapping("/api/classes")
@RestController
public class ClassController {

	ClassService classService;

	@PostMapping
	public ResponseDTO<String> createClass(@RequestBody CreateClassRequestDto request) {
		classService.createClass(request);

		return ResponseDTO.<String>builder()
				.success(true)
				.message("Class created successfully")
				.data(null)
				.build();
	}

	@PatchMapping("/{classId}")
	public ResponseDTO<String> updateClass(
			@PathVariable Long classId,
			@RequestBody UpdateClassRequestDto request
	) {
		classService.updateClass(classId, request);

		return ResponseDTO.<String>builder()
				.success(true)
				.message("Class updated successfully")
				.data(null)
				.build();
	}

	@DeleteMapping("/{classId}")
	public ResponseDTO<String> deleteClass(@PathVariable Long classId) {
		classService.deleteClass(classId);

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