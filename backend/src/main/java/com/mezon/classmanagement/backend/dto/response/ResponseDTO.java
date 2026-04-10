package com.mezon.classmanagement.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.mezon.classmanagement.backend.constant.DateTimeConstant;

import java.time.Instant;

public record ResponseDTO<Data>(
		@JsonProperty(value = "success")
		boolean success,

		@JsonProperty(value = "message")
		String message,

		@JsonProperty(value = "data")
		Data data,

		@JsonFormat(pattern = DateTimeConstant.PATTERN, timezone = DateTimeConstant.TIMEZONE)
		@JsonProperty(value = "time")
		Instant timestamp
) {
	public ResponseDTO(boolean success, String message, Data data) {
		this(success, message, data, Instant.now());
	}
}