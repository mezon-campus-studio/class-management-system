package com.mezon.classmanagement.backend.service;

import com.mezon.classmanagement.backend.constant.JwtConstant;
import com.mezon.classmanagement.backend.dto.request.SignInRequestDto;
import com.mezon.classmanagement.backend.dto.request.SignOutRequestDto;
import com.mezon.classmanagement.backend.dto.request.SignUpRequestDto;
import com.mezon.classmanagement.backend.dto.response.SignInResponseDto;
import com.mezon.classmanagement.backend.dto.response.SignOutResponseDto;
import com.mezon.classmanagement.backend.dto.response.SignUpResponseDto;
import com.mezon.classmanagement.backend.entity.InvalidatedToken;
import com.mezon.classmanagement.backend.entity.User;
import com.mezon.classmanagement.backend.exception.GlobalException;
import com.mezon.classmanagement.backend.repository.InvalidatedTokenRepository;
import com.mezon.classmanagement.backend.repository.UserRepository;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.SignedJWT;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.util.Collections;
import java.util.Date;
import java.util.Optional;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Service
public class AuthService {

	AuthenticationManager authenticationManager;
	UserRepository userRepository;
	JwtService jwtService;
	InvalidatedTokenRepository invalidatedTokenRepository;

	public SignInResponseDto signIn(SignInRequestDto request) {
		long ACCESS_TOKEN_EXPIRY_MINUTES = 15;
		long REFRESH_TOKEN_EXPIRY_DAYS = 7;

		UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword());
		authenticationManager.authenticate(authenticationToken);

		User user = userRepository
				.findByUsername(request.getUsername())
				.orElseThrow(() -> new GlobalException(GlobalException.Type.NOT_FOUND, "User not found"));

		String accessToken = jwtService.generateAccessToken(user.getUsername(), null, null, Collections.emptyList());
		String refreshToken = jwtService.generateRefreshToken(user.getUsername());

		return SignInResponseDto.builder()
				.accessToken(accessToken)
				.refreshToken(refreshToken)
				.build();
	}

	public SignUpResponseDto signUp(SignUpRequestDto request) {
		Optional<User> userOptional = userRepository.findByUsername(request.getUsername());
		if (userOptional.isPresent()) {
			throw new GlobalException(GlobalException.Type.ALREADY_EXISTS, "User exists");
		}

		User user = User.builder()
				.username(request.getUsername())
				.hashedPassword(new BCryptPasswordEncoder(10).encode(request.getPassword()))
				.displayName(request.getDisplayName())
				.build();
		User insertedUser = userRepository.save(user);

		return SignUpResponseDto.builder()
				.username(insertedUser.getUsername())
				.build();
	}

	public SignOutResponseDto signOut(SignOutRequestDto request) {
		try {
			SignedJWT signedJWT = verifyToken(request.getAccessToken());

			String jti = signedJWT.getJWTClaimsSet().getJWTID();
			Date expiryDate = signedJWT.getJWTClaimsSet().getExpirationTime();

			InvalidatedToken invalidatedToken = InvalidatedToken.builder()
					.jti(jti)
					.expiryDate(expiryDate.toInstant())
					.build();
			invalidatedTokenRepository.save(invalidatedToken);

			return SignOutResponseDto.builder()
					.success(true)
					.build();
		} catch (Exception e) {
			return SignOutResponseDto.builder()
					.success(false)
					.build();
		}
	}

	private SignedJWT verifyToken(String token) throws JOSEException, ParseException {
		JWSVerifier verifier = new MACVerifier(JwtConstant.SIGNER_KEY.getBytes());

		SignedJWT signedJWT = SignedJWT.parse(token);

		Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

		var verified = signedJWT.verify(verifier);

		if (!(verified && expiryTime.after(new Date()))) {
			//Exception throw
			return null;
		}

		return signedJWT;
	}

}