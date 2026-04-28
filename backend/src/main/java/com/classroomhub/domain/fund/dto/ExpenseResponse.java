package com.classroomhub.domain.fund.dto;

import com.classroomhub.domain.fund.entity.FundExpense;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ExpenseResponse(
        UUID id,
        String title,
        BigDecimal amount,
        String description,
        UUID recordedById,
        Instant expenseDate
) {
    public static ExpenseResponse from(FundExpense e) {
        return new ExpenseResponse(
                e.getId(), e.getTitle(), e.getAmount(),
                e.getDescription(), e.getRecordedById(), e.getExpenseDate()
        );
    }
}
