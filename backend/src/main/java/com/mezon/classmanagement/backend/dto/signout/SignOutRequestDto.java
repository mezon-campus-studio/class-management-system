package com.mezon.classmanagement.backend.dto.signout;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
public final class SignOutRequestDto {
    String accessToken;
}