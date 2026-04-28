package com.classroomhub.domain.fund.dto;

import com.classroomhub.domain.fund.entity.FundPayment;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PaymentResponse(
        UUID id,
        UUID collectionId,
        UUID memberId,
        BigDecimal amount,
        FundPayment.Status status,
        FundPayment.Method paymentMethod,
        String transactionRef,
        String note,
        UUID confirmedById,
        Instant confirmedAt,
        Instant createdAt
) {
    public static PaymentResponse from(FundPayment p) {
        return new PaymentResponse(
                p.getId(), p.getCollectionId(), p.getMemberId(), p.getAmount(),
                p.getStatus(), p.getPaymentMethod(), p.getTransactionRef(), p.getNote(),
                p.getConfirmedById(), p.getConfirmedAt(), p.getCreatedAt()
        );
    }
}
