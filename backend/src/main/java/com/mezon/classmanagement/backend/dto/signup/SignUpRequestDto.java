package com.mezon.classmanagement.backend.dto.signup;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
public final class SignUpRequestDto {
	String username;
	String password;
	String displayName;
}