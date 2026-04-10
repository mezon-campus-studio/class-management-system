package com.mezon.classmanagement.backend.mapper;

import com.mezon.classmanagement.backend.dto.response.child.UserResponseDto;
import com.mezon.classmanagement.backend.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
	UserResponseDto toUserResponseDto(User user);
}