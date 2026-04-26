package com.mezon.classmanagement.backend.controller;

import com.mezon.classmanagement.backend.constant.WarningConstant;
import com.mezon.classmanagement.backend.dto.ResponseDTO;
import com.mezon.classmanagement.backend.dto.signin.SignInResponseDto;
import com.mezon.classmanagement.backend.entity.MezonUser;
import com.mezon.classmanagement.backend.exception.GlobalException;
import com.mezon.classmanagement.backend.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@SuppressWarnings({WarningConstant.SPELL_CHECKING_INSPECTION})
@RequiredArgsConstructor
@RequestMapping("/api/auth/mezon")
@RestController
public class MezonAuthController {

	private final AuthService authService;

	@Value("${mezon.client-id}")
	private String clientId;

	@Value("${mezon.client-secret}")
	private String clientSecret;

	@Value("${mezon.redirect-uri}")
	private String redirectUri;

	@Value("${mezon.auth-url}")
	private String authUrl;

	@Value("${mezon.token-url}")
	private String tokenUrl;

	@Value("${mezon.user-info-url}")
	private String userInfoUrl;

	private final RestTemplate restTemplate = new RestTemplate();

	@GetMapping("/signin")
	public void signin(
			HttpServletResponse response,
			HttpSession session
	) throws IOException {
		String state = generate11CharState();
		session.setAttribute("MEZON_OAUTH2_STATE", state);
		String authorizationUrl = String.format(
				"%s?client_id=%s&redirect_uri=%s&response_type=code&scope=openid+offline&state=%s",
				authUrl, clientId, redirectUri, state
		);

		response.sendRedirect(authorizationUrl);
	}

	@GetMapping("/callback")
	public ResponseDTO<SignInResponseDto> callback(
			@RequestParam("code") String code,
			@RequestParam("state") String state,
			HttpSession session
	) {
		String savedState = (String) session.getAttribute("MEZON_OAUTH2_STATE");
		if (savedState == null || !savedState.equals(state)) {
			throw new GlobalException(GlobalException.Type.MEZON_AUTH_ERROR, "Mezon auth error");
		}
		session.removeAttribute("MEZON_OAUTH2_STATE");

		try {
			String accessToken = exchangeCodeForToken(code, state);

			MezonUser mezonUser = getUserInfo(accessToken);
			SignInResponseDto signInResponseDto = authService.signInMezon(mezonUser);

			return ResponseDTO.<SignInResponseDto>builder()
					.success(true)
					.message("Sign in successful")
					.data(signInResponseDto)
					.build();
		} catch (Exception e) {
			throw new GlobalException(GlobalException.Type.MEZON_AUTH_ERROR, e.getMessage());
		}
	}

	private String exchangeCodeForToken(String code, String state) {
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

		MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
		body.add("grant_type", "authorization_code");
		body.add("code", code);
		body.add("state", state);
		body.add("client_id", clientId);
		body.add("client_secret", clientSecret);
		body.add("redirect_uri", redirectUri);

		HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

		ResponseEntity<Map> response = restTemplate.postForEntity(tokenUrl, request, Map.class);

		if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
			return (String) response.getBody().get("access_token");
		}

		throw new GlobalException(GlobalException.Type.MEZON_AUTH_ERROR, "Mezon auth error 2");
	}

	private MezonUser getUserInfo(String accessToken) {
		HttpHeaders headers = new HttpHeaders();
		headers.setBearerAuth(accessToken);

		HttpEntity<String> request = new HttpEntity<>(headers);

		ResponseEntity<MezonUser> response = restTemplate.exchange(
				userInfoUrl,
				HttpMethod.GET,
				request,
				MezonUser.class
		);

		return response.getBody();
	}

	private String generate11CharState() {
		return UUID.randomUUID().toString().replace("-", "").substring(0, 11);
	}

}