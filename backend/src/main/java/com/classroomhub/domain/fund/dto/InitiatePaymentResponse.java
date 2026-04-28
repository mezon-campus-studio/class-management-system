package com.classroomhub.domain.fund.dto;

import com.classroomhub.domain.fund.entity.FundPayment;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Response from {@code POST /payments/initiate}.
 * <ul>
 *   <li>BANK_TRANSFER → {@link #qrImageUrl} points to a VietQR image; the
 *       caller shows it to the student to scan from a banking app.</li>
 *   <li>VNPAY / MOMO  → {@link #redirectUrl} hands the browser off to the
 *       gateway's hosted checkout.</li>
 *   <li>CASH          → both URLs null; the student is informed that the
 *       payment has been recorded as PENDING for the treasurer to confirm.</li>
 * </ul>
 */
public record InitiatePaymentResponse(
        UUID paymentId,
        FundPayment.Method method,
        FundPayment.Status status,
        BigDecimal amount,
        String transferContent,
        String qrImageUrl,
        String redirectUrl,
        String bankAccountName,
        String bankAccountNumber,
        String bankShortName
) {}
