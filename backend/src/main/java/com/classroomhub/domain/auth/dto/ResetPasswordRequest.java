package com.classroomhub.domain.auth.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.deser.std.StringDeserializer;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @NotBlank @Email String email,
        @NotBlank @Size(min = 6, max = 6) String otp,
        @NotBlank @Size(min = 8)
        @JsonDeserialize(using = StringDeserializer.class)
        String newPassword
) {}
