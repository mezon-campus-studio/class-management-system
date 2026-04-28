package com.classroomhub.domain.parent.repository;

import com.classroomhub.domain.parent.entity.ParentLink;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ParentLinkRepository extends JpaRepository<ParentLink, UUID> {

    List<ParentLink> findByParentIdAndStatus(UUID parentId, ParentLink.Status status);

    List<ParentLink> findByStudentIdAndStatus(UUID studentId, ParentLink.Status status);

    Optional<ParentLink> findByParentIdAndStudentId(UUID parentId, UUID studentId);

    boolean existsByParentIdAndStudentId(UUID parentId, UUID studentId);
}
