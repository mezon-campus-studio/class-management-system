package com.mezon.classmanagement.backend.domain.clazz.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.mezon.classmanagement.backend.common.annotation.DTO;
import com.mezon.classmanagement.backend.common.constant.DateTimeConstant;
import com.mezon.classmanagement.backend.domain.clazz.entity.Class;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@JsonPropertyOrder(value = {
		"id",
		"owner_user_id",
		"owner_display_name",
		"name",
		"description",
		"code",
		"avatar_url",
		"privacy",
		"created_at"
})
@JsonInclude(value = JsonInclude.Include.NON_NULL)
@FieldDefaults(level = AccessLevel.PRIVATE)
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@DTO
public final class ClassResponseDto {

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