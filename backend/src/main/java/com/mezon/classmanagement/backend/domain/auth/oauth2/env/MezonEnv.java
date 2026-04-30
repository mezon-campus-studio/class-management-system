package com.mezon.classmanagement.backend.domain.auth.oauth2.env;

import com.mezon.classmanagement.backend.common.constant.WarningConstant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@SuppressWarnings({WarningConstant.SPELL_CHECKING_INSPECTION})
@Component
public final class MezonEnv {
	@Value("${mezon.client-id}")
	public String CLIENT_ID;

	@Value("${mezon.client-secret}")
	public String CLIENT_SECRET;

	@Value("${mezon.redirect-uri}")
	public String REDIRECT_URI;

	@Value("${mezon.auth-url}")
	public String AUTH_URL;

	@Value("${mezon.token-url}")
	public String TOKEN_URL;

	@Value("${mezon.user-info-url}")
	public String USER_INFO_URL;
}