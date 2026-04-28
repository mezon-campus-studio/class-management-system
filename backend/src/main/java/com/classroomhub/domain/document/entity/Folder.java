package com.classroomhub.domain.document.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "folders")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Folder {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(name = "classroom_id", nullable = false)
    UUID classroomId;

    @Column(nullable = false, length = 200)
    String name;

    @Column(name = "parent_id")
    UUID parentId;

    @Column(name = "created_by_id", nullable = false)
    UUID createdById;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    Instant updatedAt;
}
