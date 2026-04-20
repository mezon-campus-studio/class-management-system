package com.mezon.classmanagement.backend.dto.signin;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
public final class SignInRequestDto {
    String username;
    String password;
}