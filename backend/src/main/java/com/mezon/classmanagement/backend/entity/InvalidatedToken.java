package com.mezon.classmanagement.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Entity
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(
        name = "invalidated_tokens",
        indexes = {
                @Index(name = "index_invalidated_tokens_expiry_date", columnList = "expiry_date")
        }
)
public class InvalidatedToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    Long id;

    @Column(name = "jti", nullable = false, unique = true)
    String jti;

    @Column(name = "expiry_date", nullable = false)
    Instant expiryDate;
}