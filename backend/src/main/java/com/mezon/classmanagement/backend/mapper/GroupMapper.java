package com.mezon.classmanagement.backend.mapper;

import com.mezon.classmanagement.backend.dto.group.CreateAndUpdateGroupRquestDto;
import com.mezon.classmanagement.backend.dto.group.Groupdto;
import com.mezon.classmanagement.backend.entity.Group;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface GroupMapper {
    @Mapping(target = "clazz", ignore = true)
    @Mapping(target = "leader", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Group toGroup(CreateAndUpdateGroupRquestDto dto);

    @Mapping(target = "leaderUserId", source = "leader.id")
    @Mapping(target = "classId", source = "clazz.id")
    Groupdto toCreateGroupResponseDto(Group group);

    @Mapping(target = "leaderUserId", source = "leader.id")
    @Mapping(target = "classId", source = "clazz.id")
    Groupdto toUpdateGroupResponseDto(Group group);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "clazz", ignore = true)
    @Mapping(target = "leader", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateGroupFromRequestDto(CreateAndUpdateGroupRquestDto dto, @MappingTarget Group group);
}


