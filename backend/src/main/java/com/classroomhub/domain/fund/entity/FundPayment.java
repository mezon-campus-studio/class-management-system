package com.classroomhub.domain.fund.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "fund_payments")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FundPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(name = "collection_id", nullable = false)
    UUID collectionId;

    @Column(name = "classroom_id", nullable = false)
    UUID classroomId;

    @Column(name = "member_id", nullable = false)
    UUID memberId;

    @Column(nullable = false, precision = 15, scale = 2)
    BigDecimal amount;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    Status status = Status.PENDING;

    @Column(name = "payment_method", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    Method paymentMethod = Method.CASH;

    /** Gateway-assigned transaction id (VNPay TxnRef, MoMo orderId, bank ref...). */
    @Column(name = "transaction_ref", length = 100)
    String transactionRef;

    @Column(length = 500)
    String note;

    @Column(name = "confirmed_by_id")
    UUID confirmedById;

    @Column(name = "confirmed_at")
    Instant confirmedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    Instant updatedAt;

    public enum Status {
        PENDING,
        CONFIRMED,
        REJECTED
    }

    public enum Method {
        CASH,
        BANK_TRANSFER,
        VNPAY,
        MOMO
    }
}
