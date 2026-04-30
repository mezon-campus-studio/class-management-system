package com.mezon.classmanagement.backend.domain.auth.oauth2.factory;

import com.mezon.classmanagement.backend.domain.auth.oauth2.strategy.OAuthStrategy;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Component;
import java.util.Map;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Component
public class OAuthFactory {

	Map<String, OAuthStrategy> strategies;

	public OAuthStrategy getStrategy(String provider) {
		OAuthStrategy strategy = strategies.get(provider.toLowerCase());
		if (strategy == null) {
			throw new IllegalArgumentException("Hệ thống chưa hỗ trợ đăng nhập bằng: " + provider);
		}
		return strategy;
	}

}