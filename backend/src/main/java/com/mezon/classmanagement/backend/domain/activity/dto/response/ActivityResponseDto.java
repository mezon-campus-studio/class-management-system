package com.mezon.classmanagement.backend.domain.activity.dto.response;

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
		"name",
		"description",
		"start_at",
		"end_at",
		"registration_end_at",
		"location",
		"point",
		"is_mandatory",
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
public final class ActivityResponseDto {

	@JsonProperty(value = "id")
	Long id;

	@JsonProperty(value = "class_id")
	Long classId;

	@JsonProperty(value = "name")
	String name;

	@JsonProperty(value = "description")
	String description;

	@JsonProperty(value = "start_at")
	Instant startAt;

	@JsonProperty(value = "end_at")
	Instant endAt;

	@JsonProperty(value = "registration_end_at")
	Instant registrationEndAt;

	@JsonProperty(value = "location")
	String location;

	@JsonProperty(value = "point")
	Short point;

	@JsonProperty(value = "is_mandatory")
	Boolean isMandatory;

	@JsonFormat(pattern = DateTimeConstant.PATTERN, timezone = DateTimeConstant.TIMEZONE)
	@JsonProperty(value = "created_at")
	Instant createdAt;

}