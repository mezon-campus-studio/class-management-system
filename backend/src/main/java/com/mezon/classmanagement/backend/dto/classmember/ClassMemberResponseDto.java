package com.mezon.classmanagement.backend.dto.classmember;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.mezon.classmanagement.backend.entity.ClassUser;

public record ClassMemberResponseDto(
		@JsonProperty(value = "class_id")
		Long classId,

		@JsonProperty(value = "class_name")
		String className,

		@JsonProperty(value = "member_id")
		Long memberId,

		@JsonProperty(value = "member_display_name")
		String memberDisplayName,

		@JsonProperty(value = "member_avatar_url")
		String memberAvatarUrl,

		@JsonProperty(value = "member_role")
		ClassUser.Role memberRole
) {}