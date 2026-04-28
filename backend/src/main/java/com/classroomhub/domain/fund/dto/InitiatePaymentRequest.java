package com.classroomhub.domain.fund.dto;

import com.classroomhub.domain.fund.entity.FundPayment;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Student-initiated payment for a collection. Returns either a VietQR image
 * URL (BANK_TRANSFER) or a redirect URL (VNPAY / MOMO). For CASH the response
 * just acknowledges that a pending payment record was created — treasurer
 * confirms it later when the cash arrives.
 */
public record InitiatePaymentRequest(
        @NotNull UUID collectionId,
        @NotNull FundPayment.Method method,
        BigDecimal amount,
        String note
) {}
