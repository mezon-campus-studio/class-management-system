package com.mezon.classmanagement.backend.service;

import com.mezon.classmanagement.backend.constant.JwtConstant;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSObject;
import com.nimbusds.jose.Payload;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

	public String generateAccessToken(String username) {
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

}