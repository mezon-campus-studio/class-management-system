package com.mezon.classmanagement.backend.dto.signup;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Setter
@Getter
@Builder
public final class SignUpResponseDto {
	@JsonProperty(value = "username")
	String username;
}