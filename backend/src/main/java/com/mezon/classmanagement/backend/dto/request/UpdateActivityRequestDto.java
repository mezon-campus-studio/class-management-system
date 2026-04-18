package com.mezon.classmanagement.backend.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
public final class UpdateActivityRequestDto {
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
}