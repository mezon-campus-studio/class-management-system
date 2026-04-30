package com.mezon.classmanagement.backend.domain.auth.oauth2.controller;

import com.mezon.classmanagement.backend.common.constant.WarningConstant;
import com.mezon.classmanagement.backend.common.dto.ResponseDTO;
import com.mezon.classmanagement.backend.domain.auth.dto.signin.SignInResponseDto;
import com.mezon.classmanagement.backend.common.exeption.entity.GlobalException;
import com.mezon.classmanagement.backend.domain.auth.oauth2.factory.OAuthFactory;
import com.mezon.classmanagement.backend.domain.auth.oauth2.service.GoogleOAuthService;
import com.mezon.classmanagement.backend.domain.auth.oauth2.service.MezonOAuthService;
import com.mezon.classmanagement.backend.domain.auth.oauth2.strategy.OAuthStrategy;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@SuppressWarnings({WarningConstant.SPELL_CHECKING_INSPECTION})
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@RequestMapping("/api/auth/{provider}")
@RestController
public class OAuthController {

	OAuthFactory oauthFactory;
	GoogleOAuthService googleOAuthService;
	MezonOAuthService mezonOAuthService;

	@GetMapping("/signin")
	public void signin(
			@PathVariable String provider,
			HttpServletResponse response,
			HttpSession session
	) throws IOException {
		OAuthStrategy strategy = oauthFactory.getStrategy(provider);

		String url = strategy.getAuthUrl();

		if (OAuthStrategy.MEZON.equals(strategy.getName())) {
			String state = url.substring(url.lastIndexOf("&state=") + 7);
			session.setAttribute("MEZON_OAUTH2_STATE", state);
		}

		response.sendRedirect(url);
	}

	@GetMapping("/callback")
	public ResponseDTO<SignInResponseDto> callback(
			@PathVariable String provider,
			@RequestParam("code") String code,
			@RequestParam(value = "state", required = false) String state,
			HttpSession session
	) {
		OAuthStrategy strategy = oauthFactory.getStrategy(provider);

		SignInResponseDto signInResponseDto = null;

		if (OAuthStrategy.MEZON.equals(strategy.getName())) {
			String savedState = (String) session.getAttribute("MEZON_OAUTH2_STATE");
			if (savedState == null || !savedState.equals(state)) {
				throw new GlobalException(GlobalException.Type.OAUTH_ERROR, "Sign in with Mezon failed");
			}
			session.removeAttribute("MEZON_OAUTH2_STATE");

			String accessToken = mezonOAuthService.exchangeCodeForToken(code, state);
			signInResponseDto = strategy.auth(accessToken);
		}

		if (OAuthStrategy.GOOGLE.equals(strategy.getName())) {
			String accessToken = googleOAuthService.exchangeCodeForToken(code);
			signInResponseDto = strategy.auth(accessToken);
		}

		return ResponseDTO.<SignInResponseDto>builder()
				.success(true)
				.message("Sign in successful")
				.data(signInResponseDto)
				.build();
	}
}