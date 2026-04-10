package com.mezon.classmanagement.backend.controller;

import com.mezon.classmanagement.backend.dto.response.child.ClassMemberResponseDto;
import com.mezon.classmanagement.backend.dto.response.ResponseDTO;
import com.mezon.classmanagement.backend.service.ClassService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/classes")
public class ClassController {

	ClassService classService;

	@GetMapping("/{classId}/members")
	public ResponseDTO<List<ClassMemberResponseDto>> getClassMembers(@PathVariable Long classId) {
		return new ResponseDTO<>(
				true,
				"Class members found",
				classService.getClassMembers(classId)
		);
	}

}