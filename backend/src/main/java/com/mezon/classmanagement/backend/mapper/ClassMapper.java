package com.mezon.classmanagement.backend.mapper;

import com.mezon.classmanagement.backend.dto.clazz.ClassDto;
import com.mezon.classmanagement.backend.dto.clazz.create.CreateClassRequestDto;
import com.mezon.classmanagement.backend.entity.Class;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;

@Mapper(componentModel = "spring")
public interface ClassMapper {

	/**
	 * Map Request to Entity
	 */

	Class toClass(CreateClassRequestDto request);

	@Mappings({
			@Mapping(target = "owner.id", ignore = true),
			@Mapping(target = "createdAt", ignore = true)
	})
	Class toClassFromUpdateClassRequestDto(ClassDto request);

	/**
	 * Map Entity to Response
	 */

	@Mapping(source = "owner.id", target = "ownerUserId")
	@Mappings({
			@Mapping(source = "owner.id", target = "ownerUserId"),
			@Mapping(target = "id", ignore = true)
	})
	ClassDto toCreateClassResponseDto(Class clazz);

	@Mapping(source = "owner.id", target = "ownerUserId")
	ClassDto toUpdateClassResponseDto(Class clazz);

	@Mappings({
			@Mapping(target = "ownerUserId", ignore = true),
			@Mapping(target = "description", ignore = true),
			@Mapping(target = "code", ignore = true),
			@Mapping(target = "privacy", ignore = true)
	})
	ClassDto toJoinClassResponseDto(Class clazz);
}