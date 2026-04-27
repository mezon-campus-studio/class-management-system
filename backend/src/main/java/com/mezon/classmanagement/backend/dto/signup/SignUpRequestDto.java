package com.mezon.classmanagement.backend.dto.signup;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.mezon.classmanagement.backend.entity.User;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Builder
public final class SignUpRequestDto {
	@JsonProperty(value = "type")
	User.Provider provider;

	@JsonProperty(value = "provider_id")
	String providerId;

	@JsonProperty(value = "username")
	String username;

	@JsonProperty(value = "password")
	String password;

	@JsonProperty(value = "display_name")
	String displayName;

	@JsonProperty(value = "avatar_url")
	String avatarUrl;

	@JsonProperty(value = "email")
	String email;
}