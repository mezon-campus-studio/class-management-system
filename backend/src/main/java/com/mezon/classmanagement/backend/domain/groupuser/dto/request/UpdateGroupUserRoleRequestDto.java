package com.mezon.classmanagement.backend.domain.groupuser.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.mezon.classmanagement.backend.common.annotation.DTO;
import com.mezon.classmanagement.backend.domain.groupuser.entity.GroupUser;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@DTO
public final class UpdateGroupUserRoleRequestDto {

	@JsonProperty(value = "role")
	GroupUser.Role role;

//	@JsonProperty(value = "group_id")
//	Long groupId;
//
//	@JsonProperty(value = "desk")
//	Short desk;
//
//	@JsonProperty(value = "desk_position")
//	Short deskPosition;

}