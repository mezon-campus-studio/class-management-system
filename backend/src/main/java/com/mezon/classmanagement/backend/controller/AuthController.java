package com.mezon.classmanagement.backend.controller;

import com.mezon.classmanagement.backend.dto.request.SignInRequestDto;
import com.mezon.classmanagement.backend.dto.request.SignOutRequestDto;
import com.mezon.classmanagement.backend.dto.response.ResponseDTO;
import com.mezon.classmanagement.backend.dto.response.SignInResponseDto;
import com.mezon.classmanagement.backend.dto.response.SignOutResponseDto;
import com.mezon.classmanagement.backend.service.AuthService;
import com.nimbusds.jose.JOSEException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;

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
	public ResponseDTO<String> signUp() {
		return ResponseDTO.<String>builder()
				.success(true)
				.message("Sign up successful")
				.build();
	}

	@PostMapping("/signout")
	public ResponseDTO<SignOutResponseDto> signOut(@RequestBody SignOutRequestDto requestDto) throws ParseException, JOSEException {
		var result = authService.signOut(requestDto);
		return ResponseDTO.<SignOutResponseDto>builder()
				.success(result.isSuccess())
				.build();
	}

}