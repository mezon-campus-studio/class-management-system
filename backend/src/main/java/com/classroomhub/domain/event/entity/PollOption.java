package com.classroomhub.domain.event.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Entity
@Table(name = "poll_options")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PollOption {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(name = "poll_id", nullable = false)
    UUID pollId;

    @Column(nullable = false, length = 300)
    String text;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    int sortOrder = 0;
}
