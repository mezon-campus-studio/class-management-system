package com.mezon.classmanagement.backend.service;

import com.mezon.classmanagement.backend.dto.request.SignInRequestDto;
import com.mezon.classmanagement.backend.dto.request.SignUpRequestDto;
import com.mezon.classmanagement.backend.dto.response.SignInResponseDto;
import com.mezon.classmanagement.backend.dto.response.SignUpResponseDto;
import com.mezon.classmanagement.backend.entity.User;
import com.mezon.classmanagement.backend.exception.ExistsException;
import com.mezon.classmanagement.backend.exception.NotFoundException;
import com.mezon.classmanagement.backend.mapper.UserMapper;
import com.mezon.classmanagement.backend.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Service
public class AuthService {

	AuthenticationManager authenticationManager;
	UserRepository userRepository;
	JwtService jwtService;
	UserMapper userMapper;

	public SignInResponseDto signIn(SignInRequestDto request) {
		long ACCESS_TOKEN_EXPIRY_MINUTES = 15;
		long REFRESH_TOKEN_EXPIRY_DAYS = 7;

		UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword());
		authenticationManager.authenticate(authenticationToken);

		User user = userRepository
				.findByUsername(request.getUsername())
				.orElseThrow(() -> new NotFoundException("User not found"));

		String accessToken = jwtService.generateAccessToken(user.getUsername());
		String refreshToken = jwtService.generateRefreshToken(user.getUsername());

		return SignInResponseDto.builder()
				.accessToken(accessToken)
				.refreshToken(refreshToken)
				.build();
	}

	public SignUpResponseDto signUp(SignUpRequestDto request) {
		Optional<User> userOptional = userRepository.findByUsername(request.getUsername());
		if (userOptional.isPresent()) {
			throw new ExistsException("User exists");
		}

		User user = User.builder()
				.username(request.getUsername())
				.hashedPassword(new BCryptPasswordEncoder(10).encode(request.getPassword()))
				.displayName(request.getDisplayName())
				//.type(User.Type.INTERNAL)
				.build();
		User insertedUser = userRepository.save(user);

		return SignUpResponseDto.builder()
				.username(insertedUser.getUsername())
				.build();
	}

}