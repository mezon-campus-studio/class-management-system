package com.classroomhub.domain.fund.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "fund_collections")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FundCollection {

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

    @Column(name = "due_date")
    LocalDate dueDate;

    @Column(nullable = false)
    @Builder.Default
    boolean active = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    Instant updatedAt;
}
