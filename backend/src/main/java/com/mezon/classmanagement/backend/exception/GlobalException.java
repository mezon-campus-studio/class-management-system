package com.mezon.classmanagement.backend.exception;

import com.mezon.classmanagement.backend.constant.WarningConstant;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@SuppressWarnings({WarningConstant.UNUSED})
@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
public class GlobalException extends RuntimeException {

	@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
	@Getter
	@AllArgsConstructor
	public enum Type {

		NOT_FOUND(404),
		ALREADY_EXISTS(409),
		INVALID_AUTHENTICATION(401);

		int code;

	}

	int code = 200;

	public GlobalException(Type type) {
		super();
	}

	public GlobalException(Type type, String message) {
		super(message);
		this.code = type.getCode();
	}

	public GlobalException(Type type, String message, Throwable cause) {
		super(message, cause);
		this.code = type.getCode();
	}

	public GlobalException(Type type, Throwable cause) {
		super(cause);
		this.code = type.getCode();
	}

}