package com.classroomhub.domain.document.repository;

import com.classroomhub.domain.document.entity.Folder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FolderRepository extends JpaRepository<Folder, UUID> {
    List<Folder> findByClassroomIdAndParentIdIsNull(UUID classroomId);
    List<Folder> findByClassroomIdAndParentId(UUID classroomId, UUID parentId);
    Optional<Folder> findByIdAndClassroomId(UUID id, UUID classroomId);
}
