package com.mezon.classmanagement.backend.domain.auth.oauth2.strategy;

import com.mezon.classmanagement.backend.common.constant.WarningConstant;
import com.mezon.classmanagement.backend.domain.auth.dto.signin.SignInResponseDto;

@SuppressWarnings({WarningConstant.SPELL_CHECKING_INSPECTION})
public interface OAuthStrategy {

	String GOOGLE = "google";
	String MEZON = "mezon";

	String getName();
	String getAuthUrl();
	SignInResponseDto auth(String accessToken);

}