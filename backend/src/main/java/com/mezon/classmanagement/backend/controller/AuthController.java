package com.mezon.classmanagement.backend.controller;

import com.mezon.classmanagement.backend.dto.ResponseDTO;
import com.mezon.classmanagement.backend.dto.signin.SignInRequestDto;
import com.mezon.classmanagement.backend.dto.signin.SignInResponseDto;
import com.mezon.classmanagement.backend.dto.signout.SignOutRequestDto;
import com.mezon.classmanagement.backend.dto.signout.SignOutResponseDto;
import com.mezon.classmanagement.backend.dto.signup.SignUpRequestDto;
import com.mezon.classmanagement.backend.dto.signup.SignUpResponseDto;
import com.mezon.classmanagement.backend.service.AuthService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@RequestMapping("/api/auth")
@RestController
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
	public ResponseDTO<SignOutResponseDto> signOut(@RequestBody SignOutRequestDto request) {
		Authentication authentication = authService.getAuthentication();
		SignOutResponseDto signOutResponseDto = authService.signOut(authentication);

		return ResponseDTO.<SignOutResponseDto>builder()
				.success(signOutResponseDto.isSuccess())
				.build();
	}

}