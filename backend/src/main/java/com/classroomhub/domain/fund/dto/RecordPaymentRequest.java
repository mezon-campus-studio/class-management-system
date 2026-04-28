package com.classroomhub.domain.fund.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record RecordPaymentRequest(
        @NotNull UUID collectionId,
        @NotNull UUID memberId,
        @NotNull BigDecimal amount,
        String note
) {}
