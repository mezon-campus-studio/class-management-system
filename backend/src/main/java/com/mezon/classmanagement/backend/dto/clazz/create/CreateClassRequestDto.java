package com.mezon.classmanagement.backend.dto.clazz.create;

import com.mezon.classmanagement.backend.entity.Class.Privacy;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)

public final class CreateClassRequestDto {

    String name;
    String description;
    String code;

    @JsonProperty(value = "avatar_url")
    String avatarUrl;

    @JsonProperty(value = "owner_username")
    String ownerUsername;

    Privacy privacy;
}
