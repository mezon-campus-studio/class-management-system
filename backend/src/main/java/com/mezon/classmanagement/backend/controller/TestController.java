package com.mezon.classmanagement.backend.controller;

import com.mezon.classmanagement.backend.dto.response.ResponseDTO;
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

	@GetMapping("/submit")
	@PreAuthorize("@classSecurity.hasAccess(#classId, 'SUBMIT_ASSIGNMENT')")
	public ResponseDTO<String> submit(@RequestHeader Long classId) {
		return ResponseDTO.<String>builder()
				.success(true)
				.message("submit")
				.build();
	}

}