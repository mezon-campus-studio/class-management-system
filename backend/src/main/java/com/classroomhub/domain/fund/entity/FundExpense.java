package com.classroomhub.domain.fund.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "fund_expenses")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FundExpense {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(name = "fund_id", nullable = false)
    UUID fundId;

    @Column(name = "classroom_id", nullable = false)
    UUID classroomId;

    @Column(nullable = false, length = 200)
    String title;

    @Column(nullable = false, precision = 15, scale = 2)
    BigDecimal amount;

    @Column(length = 500)
    String description;

    @Column(name = "recorded_by_id", nullable = false)
    UUID recordedById;

    @Column(name = "expense_date", nullable = false)
    Instant expenseDate;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    Instant createdAt;
}
