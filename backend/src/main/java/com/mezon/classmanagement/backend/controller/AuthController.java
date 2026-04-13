package com.mezon.classmanagement.backend.controller;

import com.mezon.classmanagement.backend.dto.response.ResponseDTO;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/auth")
public class AuthController {

	@PostMapping("/signin")
	public ResponseDTO<String> signIn() {
		return ResponseDTO.<String>builder()
				.success(true)
				.message("Sign in successful")
				.build();
	}

	@PostMapping("/signup")
	public ResponseDTO<String> signUp() {
		return ResponseDTO.<String>builder()
				.success(true)
				.message("Sign up successful")
				.build();
	}

	@PostMapping("/signout")
	public ResponseDTO<String> signOut() {
		return ResponseDTO.<String>builder()
				.success(true)
				.message("Sign out successful")
				.build();
	}

}