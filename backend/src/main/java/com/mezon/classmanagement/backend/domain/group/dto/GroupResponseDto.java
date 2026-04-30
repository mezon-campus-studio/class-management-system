package com.mezon.classmanagement.backend.domain.group.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.mezon.classmanagement.backend.common.annotation.DTO;
import com.mezon.classmanagement.backend.common.constant.DateTimeConstant;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@JsonPropertyOrder(value = {
        "id",
        "class_id",
        "leader_user_id",
        "leader_display_name",
        "name",
        "created_at"
})
@JsonInclude(value = JsonInclude.Include.NON_NULL)
@FieldDefaults(level = AccessLevel.PRIVATE)
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@DTO
public final class GroupResponseDto {

    @JsonProperty("id")
    Long id;

    @JsonProperty("class_id")
    Long classId;

    @JsonProperty("leader_user_id")
    Long leaderUserId;

    @JsonProperty("leader_display_name")
    String leaderDisplayName;

    @JsonProperty("name")
    String name;

    @JsonFormat(pattern = DateTimeConstant.PATTERN, timezone = DateTimeConstant.TIMEZONE)
    @JsonProperty("created_at")
    Instant createdAt;

}