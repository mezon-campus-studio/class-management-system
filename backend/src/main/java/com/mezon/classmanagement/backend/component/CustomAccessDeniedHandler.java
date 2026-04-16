package com.mezon.classmanagement.backend.component;

import com.mezon.classmanagement.backend.dto.response.ResponseDTO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.jspecify.annotations.NonNull;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;

@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

	private final ObjectMapper objectMapper = new ObjectMapper();

	@Override
	public void handle(
			@NonNull HttpServletRequest request,
			@NonNull HttpServletResponse response,
			@NonNull AccessDeniedException exception
	) throws IOException {

		ResponseDTO<?> responseDTO = ResponseDTO.builder()
				.success(false)
				.message("Forbidden")
				.build();

		response.setStatus(HttpServletResponse.SC_FORBIDDEN);
		response.setContentType("application/json");

		response.getWriter().write(objectMapper.writeValueAsString(responseDTO));
	}
}