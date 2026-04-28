package com.mezon.classmanagement.backend.dto.group;


import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateAndUpdateGroupRquestDto {
    String name;
    Long leaderUserId;
}
