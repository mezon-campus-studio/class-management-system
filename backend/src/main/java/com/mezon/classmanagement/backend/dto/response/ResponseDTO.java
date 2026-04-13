package com.mezon.classmanagement.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.mezon.classmanagement.backend.constant.DateTimeConstant;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ResponseDTO<Data> {
	@JsonProperty(value = "success")
	boolean success;

	@JsonProperty(value = "message")
	String message;

	@JsonProperty(value = "data")
	Data data;

	@Builder.Default
	@JsonFormat(pattern = DateTimeConstant.PATTERN, timezone = DateTimeConstant.TIMEZONE)
	@JsonProperty(value = "time")
	Instant timestamp = Instant.now();
}