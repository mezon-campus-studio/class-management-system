package com.mezon.classmanagement.backend.domain.auth.oauth2.strategy.impl;

import com.mezon.classmanagement.backend.domain.auth.dto.signin.SignInResponseDto;
import com.mezon.classmanagement.backend.domain.auth.oauth2.entity.GoogleUser;
import com.mezon.classmanagement.backend.domain.auth.oauth2.env.GoogleEnv;
import com.mezon.classmanagement.backend.domain.auth.oauth2.service.GoogleOAuthService;
import com.mezon.classmanagement.backend.domain.auth.oauth2.strategy.OAuthStrategy;
import com.mezon.classmanagement.backend.domain.auth.service.AuthService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Service(OAuthStrategy.GOOGLE)
public class GoogleOAuthStrategy implements OAuthStrategy {

	AuthService authService;
	GoogleEnv googleEnv;
	GoogleOAuthService googleOAuthService;

	@Override
	public String getName() {
		return GOOGLE;
	}

	@Override
	public String getAuthUrl() {
		return String.format(
				"%s?client_id=%s&redirect_uri=%s&response_type=code&scope=email profile&access_type=offline",
				googleEnv.AUTH_URL,
				googleEnv.CLIENT_ID,
				googleEnv.REDIRECT_URI
		);
	}

	@Override
	public SignInResponseDto auth(String accessToken) {
		GoogleUser googleUser = googleOAuthService.getUserInfo(accessToken);
		return authService.signInGoogle(googleUser);
	}

}