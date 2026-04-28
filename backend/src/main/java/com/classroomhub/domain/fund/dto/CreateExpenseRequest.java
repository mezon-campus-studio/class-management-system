package com.classroomhub.domain.fund.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;

public record CreateExpenseRequest(
        @NotBlank String title,
        @NotNull BigDecimal amount,
        String description,
        Instant expenseDate
) {}
