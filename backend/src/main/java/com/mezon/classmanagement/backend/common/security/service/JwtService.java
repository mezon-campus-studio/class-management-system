package com.mezon.classmanagement.backend.common.security.service;

import com.mezon.classmanagement.backend.common.constant.JwtConstant;
import com.mezon.classmanagement.backend.common.constant.WarningConstant;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSObject;
import com.nimbusds.jose.Payload;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;

@SuppressWarnings({WarningConstant.UNUSED})
@Service
public class JwtService {

	public String generateAccessToken(Long userId, String username) {
		JWSHeader jwsHeader = new JWSHeader(JWSAlgorithm.HS512);

		JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
				.subject(username)
				.issuer("tuan.com")
				.issueTime(new Date())
				.expirationTime(new Date(
						Instant.now().plus(15, ChronoUnit.MINUTES).toEpochMilli()
				))
				.jwtID(UUID.randomUUID().toString())
				.claim("type", "access")
				.claim("user_id", userId)
				.build();

		return signToken(jwsHeader, jwtClaimsSet);
	}

	public String generateRefreshToken(String username) {
		JWSHeader jwsHeader = new JWSHeader(JWSAlgorithm.HS512);

		JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
				.subject(username)
				.issuer("tuan.com")
				.issueTime(new Date())
				.expirationTime(new Date(
						Instant.now().plus(7, ChronoUnit.DAYS).toEpochMilli()
				))
				.jwtID(UUID.randomUUID().toString())
				.claim("type", "refresh")
				.build();

		return signToken(jwsHeader, jwtClaimsSet);
	}

	private String signToken(JWSHeader jwsHeader, JWTClaimsSet jwtClaimsSet) {
		Payload payload = new Payload(jwtClaimsSet.toJSONObject());
		JWSObject jwsObject = new JWSObject(jwsHeader, payload);

		try {
			jwsObject.sign(new MACSigner(JwtConstant.SIGNER_KEY.getBytes()));
			return jwsObject.serialize();
		} catch (JOSEException e) {
			throw new RuntimeException("Cannot create token", e);
		}
	}

	private Jwt getJwt(Authentication authentication) {
		return ((JwtAuthenticationToken) authentication).getToken();
	}

	public Long extractUserId(Authentication authentication) {
		Jwt jwt = getJwt(authentication);
		return Long.valueOf(jwt.getClaim("user_id").toString());
	}

	public String extractUsername(Authentication authentication) {
		Jwt jwt = getJwt(authentication);
		return jwt.getSubject();
	}

}