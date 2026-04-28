package com.classroomhub.domain.document.repository;

import com.classroomhub.domain.document.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DocumentRepository extends JpaRepository<Document, UUID> {
    List<Document> findByClassroomIdAndFolderIdIsNull(UUID classroomId);
    List<Document> findByClassroomIdAndFolderId(UUID classroomId, UUID folderId);
    Optional<Document> findByIdAndClassroomId(UUID id, UUID classroomId);
}
