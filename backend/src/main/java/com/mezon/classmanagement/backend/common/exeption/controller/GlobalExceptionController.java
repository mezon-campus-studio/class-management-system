package com.mezon.classmanagement.backend.common.exeption.controller;

import com.mezon.classmanagement.backend.common.exeption.entity.GlobalException;
import com.mezon.classmanagement.backend.common.dto.ResponseDTO;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionController {

	@ExceptionHandler(value = GlobalException.class)
	public ResponseDTO<Object> handleGlobalException(GlobalException globalException) {
		return ResponseDTO.builder()
				.success(false)
				.code(globalException.getCode())
				.message(globalException.getMessage())
				.build();
	}

}