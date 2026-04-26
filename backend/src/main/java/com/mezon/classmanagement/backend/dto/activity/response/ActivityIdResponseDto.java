package com.mezon.classmanagement.backend.dto.activity.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Builder
public final class ActivityIdResponseDto {
	@JsonProperty(value = "activity_id")
	Long activityId;
}