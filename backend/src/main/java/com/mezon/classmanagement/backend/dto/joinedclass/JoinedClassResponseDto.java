package com.mezon.classmanagement.backend.dto.joinedclass;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.mezon.classmanagement.backend.constant.DateTimeConstant;
import com.mezon.classmanagement.backend.entity.Class;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@FieldDefaults(level = AccessLevel.PRIVATE)
@AllArgsConstructor
@Getter
public final class JoinedClassResponseDto {
	@JsonProperty(value = "id")
	Long id;

	@JsonProperty(value = "owner_user_id")
	Long ownerUserId;

	@JsonProperty(value = "name")
	String name;

	@JsonProperty(value = "description")
	String description;

	@JsonProperty(value = "code")
	String code;

	@JsonProperty(value = "avatar_url")
	String avatarUrl;

	@JsonProperty(value = "privacy")
	Class.Privacy privacy;

	@JsonFormat(pattern = DateTimeConstant.PATTERN, timezone = DateTimeConstant.TIMEZONE)
	@JsonProperty(value = "created_at")
	Instant createdAt;
}