package com.classroomhub.domain.document.dto;

import com.classroomhub.domain.document.entity.Document;

import java.time.Instant;
import java.util.UUID;

public record DocumentResponse(
        UUID id,
        String name,
        UUID folderId,
        String contentType,
        Long fileSize,
        UUID uploadedById,
        Instant createdAt
) {
    public static DocumentResponse from(Document d) {
        return new DocumentResponse(d.getId(), d.getName(), d.getFolderId(),
                d.getContentType(), d.getFileSize(), d.getUploadedById(), d.getCreatedAt());
    }
}
