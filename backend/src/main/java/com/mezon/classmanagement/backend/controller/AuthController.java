package com.mezon.classmanagement.backend.controller;

import com.mezon.classmanagement.backend.dto.request.SignInRequest;
import com.mezon.classmanagement.backend.dto.response.ResponseDTO;
import com.mezon.classmanagement.backend.dto.response.SignInRespone;
import com.mezon.classmanagement.backend.service.AuthenticationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@SuppressWarnings({"SpellCheckingInspection"})
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/auth")
public class AuthController {

	AuthenticationService authenticationService;
	@PostMapping("/signin")
	public ResponseDTO<SignInRespone> authenticate(@RequestBody SignInRequest request){
		var result = authenticationService.SignIn(request);

		return new ResponseDTO<>(
				true,
				"Login success",
				result
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