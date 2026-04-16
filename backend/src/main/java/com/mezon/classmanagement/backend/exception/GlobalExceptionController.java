package com.mezon.classmanagement.backend.exception;

import com.mezon.classmanagement.backend.dto.response.ResponseDTO;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionController {

	@ExceptionHandler(value = GlobalException.class)
	public ResponseDTO<Object> handleGlobalException(GlobalException exception) {
		return ResponseDTO.builder()
				.success(false)
				.code(exception.getCode())
				.message(exception.getMessage())
				.build();
	}

}