package com.mezon.classmanagement.backend.common.exeption.controller;

import com.mezon.classmanagement.backend.common.exeption.entity.GlobalException;
import com.mezon.classmanagement.backend.common.dto.ResponseDTO;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionController {

	@ExceptionHandler(value = GlobalException.class)
	public ResponseDTO<Void> handleGlobalException(GlobalException globalException) {
		return ResponseDTO.<Void>builder()
				.success(false)
				.code(globalException.getCode())
				.message(globalException.getMessage())
				.build();
	}

	@ExceptionHandler(value = DataIntegrityViolationException.class)
	public ResponseDTO<Void> handleDataIntegrityViolationException(DataIntegrityViolationException dataIntegrityViolationException) {
		System.err.println(dataIntegrityViolationException.getMessage());
		return ResponseDTO.<Void>builder()
				.success(false)
				.code(GlobalException.Type.INVALID_REQUEST.getCode())
				.message("Invalid request")
				.build();
	}

}