package com.mezon.classmanagement.backend.service;

import com.mezon.classmanagement.backend.dto.request.SignInRequestDto;
import com.mezon.classmanagement.backend.dto.response.SignInResponseDto;
import com.mezon.classmanagement.backend.exception.NotFoundException;
import com.mezon.classmanagement.backend.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Service
public class AuthService {

	AuthenticationManager authenticationManager;
	UserRepository userRepository;
	JwtService jwtService;

	public SignInResponseDto signIn(SignInRequestDto request) {
		long ACCESS_TOKEN_EXPIRY_MINUTES = 15;
		long REFRESH_TOKEN_EXPIRY_DAYS = 7;

		UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword());
		authenticationManager.authenticate(authenticationToken);

		var user = userRepository
				.findByUsername(request.getUsername())
				.orElseThrow(() -> new NotFoundException("User not found"));

		String accessToken = jwtService.generateAccessToken(user.getUsername());
		String refreshToken = jwtService.generateRefreshToken(user.getUsername());

		return SignInResponseDto.builder()
				.accessToken(accessToken)
				.refreshToken(refreshToken)
				.build();
	}

}