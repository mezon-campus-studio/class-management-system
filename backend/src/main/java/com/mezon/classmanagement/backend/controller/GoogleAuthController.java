package com.mezon.classmanagement.backend.controller;

import com.mezon.classmanagement.backend.constant.WarningConstant;
import com.mezon.classmanagement.backend.dto.ResponseDTO;
import com.mezon.classmanagement.backend.dto.signin.SignInResponseDto;
import com.mezon.classmanagement.backend.entity.oauth.GoogleUser;
import com.mezon.classmanagement.backend.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
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

@SuppressWarnings({WarningConstant.SPELL_CHECKING_INSPECTION})
@RequiredArgsConstructor
@RequestMapping("/api/auth/google")
@RestController
public class GoogleAuthController {

	private final AuthService authService;

	@Value("${google.client-id}")
	private String clientId;

	@Value("${google.client-secret}")
	private String clientSecret;

	@Value("${google.redirect-uri}")
	private String redirectUri;

	@Value("${google.token-url}")
	private String tokenUrl;

	@Value("${google.user-info-url}")
	private String userInfoUrl;

	private final RestTemplate restTemplate = new RestTemplate();

	@GetMapping("/signin")
	public void signin(
			HttpServletResponse response
	) throws IOException {
		String reqUrl = "https://accounts.google.com/o/oauth2/v2/auth" +
				"?client_id=" + clientId +
				"&redirect_uri=" + redirectUri +
				"&response_type=code" +
				"&scope=email profile" +
				"&access_type=offline";
		response.sendRedirect(reqUrl);
	}

	@GetMapping("/callback")
	public ResponseDTO<SignInResponseDto> callback(
			@RequestParam("code") String code
	) {
		try {
			String accessToken = exchangeCodeForToken(code);

			GoogleUser googleUser = getUserInfo(accessToken);
			SignInResponseDto signInResponseDto = authService.signInGoogle(googleUser);

			return ResponseDTO.<SignInResponseDto>builder()
					.success(true)
					.message("Sign in successful")
					.data(signInResponseDto)
					.build();
		} catch (Exception e) {
			throw new RuntimeException();
		}
	}

	private String exchangeCodeForToken(String code) {
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

		MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
		body.add("grant_type", "authorization_code");
		body.add("code", code);
		body.add("client_id", clientId);
		body.add("client_secret", clientSecret);
		body.add("redirect_uri", redirectUri);

		HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

		ResponseEntity<Map> response = restTemplate.postForEntity(tokenUrl, request, Map.class);

		if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
			return (String) response.getBody().get("access_token");
		}

		throw new RuntimeException();
	}

	private GoogleUser getUserInfo(String accessToken) {
		HttpHeaders headers = new HttpHeaders();
		headers.setBearerAuth(accessToken);

		HttpEntity<String> request = new HttpEntity<>(headers);

		ResponseEntity<GoogleUser> response = restTemplate.exchange(
				userInfoUrl,
				HttpMethod.GET,
				request,
				GoogleUser.class
		);

		return response.getBody();
	}

}