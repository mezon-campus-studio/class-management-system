package com.mezon.classmanagement.backend.exception;

import com.mezon.classmanagement.backend.dto.response.ResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ExceptionController {

	// test
	@ExceptionHandler(value = ArithmeticException.class)
	public ResponseDTO<String> handle(ArithmeticException arithmeticException) {
		return new ResponseDTO<>(
				true,
				"arit",
				arithmeticException.getMessage(),
				null
		);
	}

	@ExceptionHandler(value = NotFoundException.class)
	public ResponseEntity<ResponseDTO<Object>> handleNotFoundException(NotFoundException exception) {
		return ResponseEntity
				.status(HttpStatus.NOT_FOUND)
				.body(new ResponseDTO<>(
						false,
						exception.getMessage(),
						null
				));
	}

}