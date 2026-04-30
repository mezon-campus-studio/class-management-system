package com.mezon.classmanagement.backend.domain.auth.oauth2.service;

import com.mezon.classmanagement.backend.common.constant.WarningConstant;
import com.mezon.classmanagement.backend.domain.auth.oauth2.entity.MezonUser;
import com.mezon.classmanagement.backend.common.exeption.entity.GlobalException;
import com.mezon.classmanagement.backend.domain.auth.oauth2.env.MezonEnv;
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
import java.util.UUID;

@SuppressWarnings({WarningConstant.SPELL_CHECKING_INSPECTION})
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Service
public class MezonOAuthService {

	MezonEnv mezonEnv;

	public String exchangeCodeForToken(String code, String state) {
		RestTemplate restTemplate = new RestTemplate();
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

		MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
		body.add("grant_type", "authorization_code");
		body.add("code", code);
		body.add("state", state);
		body.add("client_id", mezonEnv.CLIENT_ID);
		body.add("client_secret", mezonEnv.CLIENT_SECRET);
		body.add("redirect_uri", mezonEnv.REDIRECT_URI);

		HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

		ResponseEntity<Map> response = restTemplate.postForEntity(
				mezonEnv.TOKEN_URL,
				request,
				Map.class
		);

		if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
			return (String) response.getBody().get("access_token");
		}

		throw new GlobalException(GlobalException.Type.OAUTH_ERROR, "Sign in with Mezon failed");
	}

	public MezonUser getUserInfo(String accessToken) {
		RestTemplate restTemplate = new RestTemplate();
		HttpHeaders headers = new HttpHeaders();
		headers.setBearerAuth(accessToken);

		HttpEntity<String> request = new HttpEntity<>(headers);

		ResponseEntity<MezonUser> response = restTemplate.exchange(
				mezonEnv.USER_INFO_URL,
				HttpMethod.GET,
				request,
				MezonUser.class
		);

		return response.getBody();
	}

	public String generate11CharState() {
		return UUID.randomUUID().toString().replace("-", "").substring(0, 11);
	}

}