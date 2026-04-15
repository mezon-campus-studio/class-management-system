package com.mezon.classmanagement.backend.controller;

import com.mezon.classmanagement.backend.dto.request.SignInRequestDto;
import com.mezon.classmanagement.backend.dto.request.SignUpRequestDto;
import com.mezon.classmanagement.backend.dto.response.ResponseDTO;
import com.mezon.classmanagement.backend.dto.response.SignInResponseDto;
import com.mezon.classmanagement.backend.dto.response.SignUpResponseDto;
import com.mezon.classmanagement.backend.service.AuthService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/auth")
public class AuthController {

	AuthService authService;

	@PostMapping("/signin")
	public ResponseDTO<SignInResponseDto> signIn(@RequestBody SignInRequestDto request){
		SignInResponseDto signInResponseDto = authService.signIn(request);

		return ResponseDTO.<SignInResponseDto>builder()
				.success(true)
				.message("Sign in successful")
				.data(signInResponseDto)
				.build();
	}

	@PostMapping("/signup")
	public ResponseDTO<SignUpResponseDto> signUp(@RequestBody SignUpRequestDto request) {
		SignUpResponseDto signUpResponseDto = authService.signUp(request);

		return ResponseDTO.<SignUpResponseDto>builder()
				.success(true)
				.message("Sign up successful")
				.data(signUpResponseDto)
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