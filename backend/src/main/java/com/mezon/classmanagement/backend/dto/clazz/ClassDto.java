package com.mezon.classmanagement.backend.dto.clazz;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.mezon.classmanagement.backend.constant.DateTimeConstant;
import com.mezon.classmanagement.backend.entity.Class;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@JsonPropertyOrder({"id", "owner_user_id", "owner_display_name", "name", "description", "code", "avatar_url", "privacy", "created_at"})
@JsonInclude(JsonInclude.Include.NON_NULL)
@FieldDefaults(level = AccessLevel.PRIVATE)
@Setter
@Getter
@AllArgsConstructor
public final class ClassDto {
	@JsonProperty(value = "id")
	Long id;

	@JsonProperty(value = "owner_user_id")
	Long ownerUserId;

	@JsonProperty(value = "owner_display_name")
	String ownerDisplayName;

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