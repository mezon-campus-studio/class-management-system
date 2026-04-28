package com.classroomhub.domain.document.dto;

import com.classroomhub.domain.document.entity.Folder;

import java.time.Instant;
import java.util.UUID;

public record FolderResponse(
        UUID id,
        String name,
        UUID parentId,
        UUID createdById,
        Instant createdAt
) {
    public static FolderResponse from(Folder f) {
        return new FolderResponse(f.getId(), f.getName(), f.getParentId(), f.getCreatedById(), f.getCreatedAt());
    }
}
