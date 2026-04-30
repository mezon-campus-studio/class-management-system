package com.mezon.classmanagement.backend.domain.auth.oauth2.env;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public final class GoogleEnv {
	@Value("${google.client-id}")
	public String CLIENT_ID;

	@Value("${google.client-secret}")
	public String CLIENT_SECRET;

	@Value("${google.redirect-uri}")
	public String REDIRECT_URI;

	@Value("${google.auth-url}")
	public String AUTH_URL;

	@Value("${google.token-url}")
	public String TOKEN_URL;

	@Value("${google.user-info-url}")
	public String USER_INFO_URL;
}