package com.mezon.classmanagement.backend.oauth.service;

import com.mezon.classmanagement.backend.oauth.entity.GoogleUser;
import com.mezon.classmanagement.backend.exception.GlobalException;
import com.mezon.classmanagement.backend.oauth.env.GoogleEnv;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Service
public class GoogleOAuthService {

	GoogleEnv googleEnv;

	public String exchangeCodeForToken(String code) {
		RestTemplate restTemplate = new RestTemplate();
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

		MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
		body.add("grant_type", "authorization_code");
		body.add("code", code);
		body.add("client_id", googleEnv.CLIENT_ID);
		body.add("client_secret", googleEnv.CLIENT_SECRET);
		body.add("redirect_uri", googleEnv.REDIRECT_URI);

		HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

		ResponseEntity<Map> response = restTemplate.postForEntity(
				googleEnv.TOKEN_URL,
				request,
				Map.class
		);

		if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
			return (String) response.getBody().get("access_token");
		}

		throw new GlobalException(GlobalException.Type.OAUTH_ERROR, "Sign in with Google failed");
	}

	public GoogleUser getUserInfo(String accessToken) {
		RestTemplate restTemplate = new RestTemplate();
		HttpHeaders headers = new HttpHeaders();
		headers.setBearerAuth(accessToken);

		HttpEntity<String> request = new HttpEntity<>(headers);

		ResponseEntity<GoogleUser> response = restTemplate.exchange(
				googleEnv.USER_INFO_URL,
				HttpMethod.GET,
				request,
				GoogleUser.class
		);

		return response.getBody();
	}

}