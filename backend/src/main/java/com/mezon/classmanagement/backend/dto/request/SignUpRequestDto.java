package com.mezon.classmanagement.backend.dto.request;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
public final class SignUpRequestDto {
	String username;
	String password;
	String displayName;
}