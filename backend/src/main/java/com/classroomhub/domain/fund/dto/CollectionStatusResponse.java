package com.classroomhub.domain.fund.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Per-collection roll-call: every classroom member appears in {@code rows}
 * with their current payment status (NONE / PENDING / CONFIRMED) so the UI
 * can render "ai đã đóng — ai chưa đóng" at a glance.
 */
public record CollectionStatusResponse(
        UUID collectionId,
        BigDecimal expectedAmount,
        int totalMembers,
        int paidCount,
        int pendingCount,
        int unpaidCount,
        BigDecimal totalCollected,
        List<MemberRow> rows
) {
    public record MemberRow(
            UUID userId,
            UUID memberId,
            String displayName,
            String avatarUrl,
            Status status,
            UUID paymentId,
            BigDecimal amountPaid,
            String paymentMethod,
            String transactionRef
    ) {}

    public enum Status {
        NONE,
        PENDING,
        CONFIRMED
    }
}
