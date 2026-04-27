package com.mezon.classmanagement.backend.exception;

import com.mezon.classmanagement.backend.constant.WarningConstant;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;

@SuppressWarnings({WarningConstant.UNUSED, WarningConstant.SPELL_CHECKING_INSPECTION})
@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
public class GlobalException extends RuntimeException {

	@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
	@Getter
	@AllArgsConstructor
	public enum Type {

		NOT_FOUND(HttpStatus.NOT_FOUND.value()),
		ALREADY_EXISTS(HttpStatus.CONFLICT.value()),
		INVALID_AUTHENTICATION(HttpStatus.UNAUTHORIZED.value()),
		OAUTH_ERROR(1000),
		FORBIDDEN(HttpStatus.FORBIDDEN.value()),
		INVALID_REQUEST(HttpStatus.BAD_REQUEST.value());

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