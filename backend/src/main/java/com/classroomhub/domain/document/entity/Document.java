package com.classroomhub.domain.document.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "documents")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(name = "classroom_id", nullable = false)
    UUID classroomId;

    @Column(name = "folder_id")
    UUID folderId;

    @Column(nullable = false, length = 300)
    String name;

    @Column(name = "file_path", nullable = false, length = 500)
    String filePath;

    @Column(name = "content_type", length = 100)
    String contentType;

    @Column(name = "file_size")
    Long fileSize;

    @Column(name = "uploaded_by_id", nullable = false)
    UUID uploadedById;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    Instant createdAt;
}
