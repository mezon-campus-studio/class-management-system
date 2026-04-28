package com.classroomhub.domain.seating.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "seating_charts")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SeatingChart {

    @Id
    @Column(name = "classroom_id")
    UUID classroomId;

    @Column(name = "rows_count", nullable = false)
    @Builder.Default
    int rowsCount = 6;

    @Column(name = "seats_per_side", nullable = false)
    @Builder.Default
    int seatsPerSide = 2;

    /** JSON: {"assignments": {"<seatKey>": "<userId>"}}. */
    @Column(name = "layout_json", nullable = false, columnDefinition = "TEXT")
    @Builder.Default
    String layoutJson = "{}";

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    Instant updatedAt;
}
