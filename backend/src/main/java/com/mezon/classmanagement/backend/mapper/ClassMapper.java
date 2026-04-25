package com.mezon.classmanagement.backend.mapper;

import com.mezon.classmanagement.backend.dto.clazz.ClassDto;
import com.mezon.classmanagement.backend.dto.clazz.create.CreateClassRequestDto;
import com.mezon.classmanagement.backend.dto.clazz.update.UpdateClassRequestDto;
import com.mezon.classmanagement.backend.entity.Class;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Mappings;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface ClassMapper {

	/**
	 * Map Request to Entity
	 */

	Class toClass(CreateClassRequestDto request);
	Class toClass(UpdateClassRequestDto request);

	@BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
	void updateClassFromRequestDto(UpdateClassRequestDto request, @MappingTarget Class entity);

	/**
	 * Map Entity to Response
	 */

	@Mappings({
			@Mapping(source = "owner.id", target = "ownerUserId"),
			//@Mapping(target = "id", ignore = true)
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