package com.classroomhub.domain.fund.dto;

import com.classroomhub.domain.fund.entity.FundCollection;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CollectionResponse(
        UUID id,
        UUID fundId,
        String title,
        BigDecimal amount,
        String description,
        LocalDate dueDate,
        boolean active
) {
    public static CollectionResponse from(FundCollection c) {
        return new CollectionResponse(
                c.getId(), c.getFundId(), c.getTitle(), c.getAmount(),
                c.getDescription(), c.getDueDate(), c.isActive()
        );
    }
}
