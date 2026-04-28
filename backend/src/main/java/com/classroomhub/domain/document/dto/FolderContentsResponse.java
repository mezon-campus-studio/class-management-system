package com.classroomhub.domain.document.dto;

import java.util.List;

public record FolderContentsResponse(
        FolderResponse folder,
        List<FolderResponse> subFolders,
        List<DocumentResponse> documents
) {}
