package com.mezon.classmanagement.backend.dto.response.child;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.mezon.classmanagement.backend.constant.DateTimeConstant;
import com.mezon.classmanagement.backend.entity.User;

import java.time.Instant;

public record UserResponseDto(
		@JsonProperty(value = "id")
		Long id,

		@JsonProperty(value = "type")
		User.Type type,

		@JsonProperty(value = "username")
		String username,

		@JsonProperty(value = "display_name")
		String displayName,

		@JsonProperty(value = "avatar_url")
		String avatarUrl,

		@JsonFormat(pattern = DateTimeConstant.PATTERN, timezone = DateTimeConstant.TIMEZONE)
		@JsonProperty(value = "joined_at")
		Instant joinedAt
) {}