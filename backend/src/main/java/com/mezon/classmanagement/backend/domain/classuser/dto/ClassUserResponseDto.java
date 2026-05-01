package com.mezon.classmanagement.backend.domain.classuser.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.mezon.classmanagement.backend.common.annotation.DTO;
import com.mezon.classmanagement.backend.common.constant.DateTimeConstant;
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
		"class_id",
		"class_name",
		"user_id",
		"user_display_name",
		"user_avatar_url"
		//"role",
		//"permission_codes"
})
@JsonInclude(value = JsonInclude.Include.NON_NULL)
@FieldDefaults(level = AccessLevel.PRIVATE)
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@DTO
public final class ClassUserResponseDto {

	@JsonProperty(value = "id")
	Long id;

	@JsonProperty(value = "class_id")
	Long classId;

	@JsonProperty(value = "class_name")
	String className;

	@JsonProperty(value = "user_id")
	Long userId;

	@JsonProperty(value = "user_display_name")
	String userDisplayName;

	@JsonProperty(value = "user_avatar_url")
	String userAvatarUrl;

	//@JsonProperty(value = "role")
	//ClassUser.Role role;

	//@JsonProperty(value = "permission_codes")
	//List<String> permissionCodes;

	@JsonFormat(pattern = DateTimeConstant.PATTERN, timezone = DateTimeConstant.TIMEZONE)
	@JsonProperty(value = "joined_at")
	Instant joinedAt;

}