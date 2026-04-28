package com.classroomhub.domain.document.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateFolderRequest(
        @NotBlank @Size(max = 200) String name,
        UUID parentId
) {}
