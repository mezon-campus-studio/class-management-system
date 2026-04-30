package com.mezon.classmanagement.backend.domain.groupuser.mapper;

import com.mezon.classmanagement.backend.domain.groupuser.dto.request.UpdateGroupUserRequestDto;
import com.mezon.classmanagement.backend.domain.groupuser.dto.response.GroupUserResponseDto;
import com.mezon.classmanagement.backend.domain.groupuser.entity.GroupUser;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface GroupUserMapper {
	@BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
	void updateGroupUserFromRequestDto(UpdateGroupUserRequestDto updateGroupUserRequestDto, @MappingTarget GroupUser groupUser);

	@Mapping(source = "clazz.id", target = "classId")
	@Mapping(source = "group.id", target = "groupId")
	@Mapping(source = "user.id", target = "userId")
	GroupUserResponseDto toGroupUserResponseDto(GroupUser groupUser);
}