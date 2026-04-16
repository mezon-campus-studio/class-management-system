package com.mezon.classmanagement.backend.service;

import com.mezon.classmanagement.backend.dto.request.SignOutRequestDto;
import com.mezon.classmanagement.backend.dto.request.SignInRequestDto;
import com.mezon.classmanagement.backend.dto.response.SignInResponseDto;
import com.mezon.classmanagement.backend.dto.response.SignOutResponseDto;
import com.mezon.classmanagement.backend.entity.InvalidatedToken;
import com.mezon.classmanagement.backend.exception.NotFoundException;
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
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.util.Collections;
import java.util.Date;

import static com.mezon.classmanagement.backend.constant.JwtConstant.SIGNER_KEY;

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

		var user = userRepository
				.findByUsername(request.getUsername())
				.orElseThrow(() -> new NotFoundException("User not found"));

		String accessToken = jwtService.generateAccessToken(user.getUsername(),null,null, Collections.emptyList());
		String refreshToken = jwtService.generateRefreshToken(user.getUsername());

		return SignInResponseDto.builder()
				.accessToken(accessToken)
				.refreshToken(refreshToken)
				.build();
	}

	public SignOutResponseDto signOut(SignOutRequestDto request) {

		try {
			var signToken = verifyToken(request.getToken());

			String jit = signToken.getJWTClaimsSet().getJWTID();
			Date expiryTime = signToken.getJWTClaimsSet().getExpirationTime();

			InvalidatedToken invalidatedToken = InvalidatedToken.builder()
					.jti(jit)
					.expiryDate(expiryTime.toInstant())
					.build();

			invalidatedTokenRepository.save(invalidatedToken);
			return SignOutResponseDto.builder()
					.success(true)
					.build();
		}
		catch (Exception e){
			return SignOutResponseDto.builder()
					.success(false)
					.build();
		}

	}

	private SignedJWT verifyToken(String token) throws JOSEException, ParseException {

		JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());

		SignedJWT signedJWT = SignedJWT.parse(token);

		Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

		var verified = signedJWT.verify(verifier);

		if(!(verified && expiryTime.after(new Date()))){
			//Exception throw
			return null;
		}
		return signedJWT;
	}

}