package com.mezon.classmanagement.backend.exception;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GlobalException extends RuntimeException {

	@Getter
	@AllArgsConstructor
	@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
	public enum Type {

		NOT_FOUND(404),
		ALREADY_EXISTS(409);

		int code;

	}

	int code = 200;

	public GlobalException() {
		super();
	}

	public GlobalException(String message) {
		super(message);
	}

	public GlobalException(Type type, String message) {
		super(message);
		this.code = type.getCode();
	}

	public GlobalException(String message, Throwable cause) {
		super(message, cause);
	}

	public GlobalException(Throwable cause) {
		super(cause);
	}

}