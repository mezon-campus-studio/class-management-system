package com.mezon.classmanagement.backend.oauth.strategy;

import com.mezon.classmanagement.backend.constant.WarningConstant;
import com.mezon.classmanagement.backend.dto.signin.SignInResponseDto;

@SuppressWarnings({WarningConstant.SPELL_CHECKING_INSPECTION})
public interface OAuthStrategy {

	String GOOGLE = "google";
	String MEZON = "mezon";

	String getName();
	String getAuthUrl();
	SignInResponseDto auth(String accessToken);

}