package com.mezon.classmanagement.backend.domain.group.mapper;

import com.mezon.classmanagement.backend.domain.group.dto.CreateAndUpdateGroupRequestDto;
import com.mezon.classmanagement.backend.domain.group.dto.GroupResponseDto;
import com.mezon.classmanagement.backend.domain.group.entity.Group;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface GroupMapper {
    Group toGroup(CreateAndUpdateGroupRequestDto createAndUpdateGroupRequestDto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateGroupFromRequestDto(CreateAndUpdateGroupRequestDto createAndUpdateGroupRequestDto, @MappingTarget Group group);

    @Mapping(source = "clazz.id", target = "classId")
    GroupResponseDto toGroupResponseDto(Group group);
}