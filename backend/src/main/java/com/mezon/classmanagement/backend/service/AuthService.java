package com.mezon.classmanagement.backend.service;

import com.mezon.classmanagement.backend.constant.JwtConstant;
import com.mezon.classmanagement.backend.constant.WarningConstant;
import com.mezon.classmanagement.backend.dto.signin.SignInRequestDto;
import com.mezon.classmanagement.backend.dto.signout.SignOutRequestDto;
import com.mezon.classmanagement.backend.dto.signup.SignUpRequestDto;
import com.mezon.classmanagement.backend.dto.signin.SignInResponseDto;
import com.mezon.classmanagement.backend.dto.signout.SignOutResponseDto;
import com.mezon.classmanagement.backend.dto.signup.SignUpResponseDto;
import com.mezon.classmanagement.backend.entity.InvalidatedToken;
import com.mezon.classmanagement.backend.entity.MezonUser;
import com.mezon.classmanagement.backend.entity.User;
import com.mezon.classmanagement.backend.entity.oauth.GoogleUser;
import com.mezon.classmanagement.backend.exception.GlobalException;
import com.mezon.classmanagement.backend.repository.InvalidatedTokenRepository;
import com.mezon.classmanagement.backend.repository.UserRepository;
import com.mezon.classmanagement.backend.util.EmailProcessor;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.SignedJWT;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.util.Date;
import java.util.Optional;

@SuppressWarnings({WarningConstant.SPELL_CHECKING_INSPECTION})
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Service
public class AuthService {

	AuthenticationManager authenticationManager;
	//UserRepository userRepository;
	UserService userService;
	JwtService jwtService;
	InvalidatedTokenRepository invalidatedTokenRepository;

	public SignInResponseDto signIn(SignInRequestDto request) {
		UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken
				= new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword());
		authenticationManager.authenticate(usernamePasswordAuthenticationToken);

		User user = userService.findByUsernameOrThrow(request.getUsername());

		String accessToken = jwtService.generateAccessToken(user.getId(), user.getUsername());
		String refreshToken = jwtService.generateRefreshToken(user.getUsername());

		return SignInResponseDto.builder()
				.accessToken(accessToken)
				.refreshToken(refreshToken)
				.build();
	}

	public SignInResponseDto signInMezon(MezonUser mezonUser) {
		userService.throwIfExistsByUsername(mezonUser.getUsername());

		SignUpRequestDto signUpRequest = SignUpRequestDto.builder()
				.type(User.Type.MEZON)
				.username(mezonUser.getUsername())
				.displayName(mezonUser.getDisplayName())
				.avatarUrl(mezonUser.getAvatar())
				.email(mezonUser.getEmail())
				.build();
		SignUpResponseDto signUpResponse = signUp(signUpRequest);

		String accessToken = jwtService.generateAccessToken(signUpResponse.getId(), signUpResponse.getUsername());
		String refreshToken = jwtService.generateRefreshToken(signUpResponse.getUsername());

		return SignInResponseDto.builder()
				.accessToken(accessToken)
				.refreshToken(refreshToken)
				.build();
	}

	public SignInResponseDto signInGoogle(GoogleUser googleUser) {
		String username = EmailProcessor.extractAndClean(googleUser.getEmail()) + "-google";
		userService.throwIfExistsByUsername(username);

		SignUpRequestDto signUpRequest = SignUpRequestDto.builder()
				.type(User.Type.GOOGLE)
				.username(username)
				.displayName(googleUser.getDisplayName())
				.avatarUrl(googleUser.getAvatarUrl())
				.email(googleUser.getEmail())
				.build();
		SignUpResponseDto signUpResponse = signUp(signUpRequest);

		String accessToken = jwtService.generateAccessToken(signUpResponse.getId(), signUpResponse.getUsername());
		String refreshToken = jwtService.generateRefreshToken(signUpResponse.getUsername());

		return SignInResponseDto.builder()
				.accessToken(accessToken)
				.refreshToken(refreshToken)
				.build();
	}

	public SignUpResponseDto signUp(SignUpRequestDto request) {
		userService.throwIfExistsByUsername(request.getUsername());

		User newUser = userService.createUser(request);

		return SignUpResponseDto.builder()
				.id(newUser.getId())
				.username(newUser.getUsername())
				.build();
	}

	@Deprecated
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

	public SignOutResponseDto signOut(Authentication authentication) {
		try {
			Jwt jwt = ((JwtAuthenticationToken) authentication).getToken();

			InvalidatedToken invalidatedToken = InvalidatedToken.builder()
					.jti(jwt.getId())
					.expiryDate(jwt.getExpiresAt())
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

	public Authentication getAuthentication() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		if (!(authentication instanceof JwtAuthenticationToken)) {
			throw new GlobalException(GlobalException.Type.INVALID_AUTHENTICATION, "Invalid authentication");
		}

		return authentication;
	}

	@Deprecated
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