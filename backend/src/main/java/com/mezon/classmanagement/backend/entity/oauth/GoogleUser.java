package com.mezon.classmanagement.backend.entity.oauth;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoogleUser {
	@JsonProperty(value = "name")
	String displayName;

	@JsonProperty(value = "picture")
	String avatarUrl;

	@JsonProperty(value = "email")
	String email;
}