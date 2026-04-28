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
@Table(name = "funds", uniqueConstraints = @UniqueConstraint(columnNames = "classroom_id"))
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Fund {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(name = "classroom_id", nullable = false, unique = true)
    UUID classroomId;

    @Column(nullable = false, length = 200)
    String name;

    @Column(length = 500)
    String description;

    @Column(nullable = false, precision = 15, scale = 2)
    @Builder.Default
    BigDecimal balance = BigDecimal.ZERO;

    /** Used to render VietQR codes and bank-transfer instructions. */
    @Column(name = "bank_account_name", length = 100)
    String bankAccountName;

    @Column(name = "bank_account_number", length = 40)
    String bankAccountNumber;

    /** SBV-assigned bank identification number (BIN). VietQR uses it as the bank id. */
    @Column(name = "bank_bin", length = 10)
    String bankBin;

    /** Short name of the bank, e.g. "VCB", "MB", "TCB" — used as a label. */
    @Column(name = "bank_short_name", length = 40)
    String bankShortName;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    Instant updatedAt;
}
