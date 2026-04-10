package com.mezon.classmanagement.backend.controller;

import com.mezon.classmanagement.backend.dto.response.child.UserResponseDto;
import com.mezon.classmanagement.backend.dto.response.ResponseDTO;
import com.mezon.classmanagement.backend.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/users")
public class UserController {

	UserService userService;

	// test
	@GetMapping("/{username}")
	public ResponseDTO<UserResponseDto> getUser(@PathVariable String username) {
		UserResponseDto userResponseDto = userService.findByUsername(username);
		return new ResponseDTO<>(
				true,
				"User found",
				userResponseDto
		);
	}

	// test
	@GetMapping("/ex/ar")
	public static void testEx() {
		throw new ArithmeticException();
	}

}