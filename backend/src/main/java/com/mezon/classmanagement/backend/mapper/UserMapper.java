package com.mezon.classmanagement.backend.mapper;

import com.mezon.classmanagement.backend.dto.signup.SignUpRequestDto;
import com.mezon.classmanagement.backend.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
	User toUser(SignUpRequestDto request);
}