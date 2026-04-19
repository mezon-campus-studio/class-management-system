package com.mezon.classmanagement.backend.dto.response;

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
public final class SignInResponseDto {
    @JsonProperty(value = "access_token")
    String accessToken;

    @JsonProperty(value = "refresh_token")
    String refreshToken;
}