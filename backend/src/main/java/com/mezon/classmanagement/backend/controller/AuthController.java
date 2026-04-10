package com.mezon.classmanagement.backend.controller;

import com.mezon.classmanagement.backend.dto.response.ResponseDTO;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@SuppressWarnings({"SpellCheckingInspection"})
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/auth")
public class AuthController {

	@PostMapping("/signin")
	public ResponseDTO<String> signIn() {
		return new ResponseDTO<>(
				true,
				"Đăng nhập thành công",
				null
		);
	}

	@PostMapping("/signup")
	public ResponseDTO<String> signUp() {
		return new ResponseDTO<>(
				true,
				"Đăng ký thành công",
				null
		);
	}

	@PostMapping("/signout")
	public ResponseDTO<String> signOut() {
		return new ResponseDTO<>(
				true,
				"Đăng xuất thành công",
				null
		);
	}

}