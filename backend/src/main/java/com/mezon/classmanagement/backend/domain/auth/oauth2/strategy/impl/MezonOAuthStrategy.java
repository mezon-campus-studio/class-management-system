package com.mezon.classmanagement.backend.domain.auth.oauth2.strategy.impl;

import com.mezon.classmanagement.backend.domain.auth.dto.signin.SignInResponseDto;
import com.mezon.classmanagement.backend.domain.auth.oauth2.entity.MezonUser;
import com.mezon.classmanagement.backend.domain.auth.oauth2.env.MezonEnv;
import com.mezon.classmanagement.backend.domain.auth.oauth2.service.MezonOAuthService;
import com.mezon.classmanagement.backend.domain.auth.oauth2.strategy.OAuthStrategy;
import com.mezon.classmanagement.backend.domain.auth.service.AuthService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Service(OAuthStrategy.MEZON)
public class MezonOAuthStrategy implements OAuthStrategy {

	AuthService authService;
	MezonEnv mezonEnv;
	MezonOAuthService mezonOAuthService;

	@Override
	public String getName() {
		return MEZON;
	}

	@Override
	public String getAuthUrl() {
		return String.format(
				"%s?client_id=%s&redirect_uri=%s&response_type=code&scope=openid+offline&state=%s",
				mezonEnv.AUTH_URL,
				mezonEnv.CLIENT_ID,
				mezonEnv.REDIRECT_URI,
				mezonOAuthService.generate11CharState()
		);
	}

	@Override
	public SignInResponseDto auth(String accessToken) {
		MezonUser mezonUser = mezonOAuthService.getUserInfo(accessToken);
		return authService.signInMezon(mezonUser);
	}

}