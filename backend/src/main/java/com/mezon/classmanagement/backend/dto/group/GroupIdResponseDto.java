package com.mezon.classmanagement.backend.dto.group;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GroupIdResponseDto {
    Long groupId;
}
