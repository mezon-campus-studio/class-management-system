package com.mezon.classmanagement.backend.dto.group;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Groupdto {
    Long id;
    Long classId;
    Long leaderUserId;
    String leaderName;
    String name;
    Instant createdAt;
}
