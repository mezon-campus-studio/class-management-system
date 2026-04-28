package com.classroomhub.domain.document.controller;

import com.classroomhub.common.response.ApiResponse;
import com.classroomhub.common.security.SecurityUtils;
import com.classroomhub.domain.document.dto.CreateFolderRequest;
import com.classroomhub.domain.document.dto.DocumentResponse;
import com.classroomhub.domain.document.dto.FolderContentsResponse;
import com.classroomhub.domain.document.dto.FolderResponse;
import com.classroomhub.domain.document.entity.Document;
import com.classroomhub.domain.document.service.DocumentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/classrooms/{classroomId}/documents")
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping("/folders")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<FolderResponse> createFolder(
            @PathVariable UUID classroomId,
            @Valid @RequestBody CreateFolderRequest req) {
        return ApiResponse.ok(documentService.createFolder(classroomId, req, SecurityUtils.getCurrentUser().getId()));
    }

    @GetMapping("/folders")
    public ApiResponse<List<FolderResponse>> listRootFolders(@PathVariable UUID classroomId) {
        return ApiResponse.ok(documentService.listRootFolders(classroomId, SecurityUtils.getCurrentUser().getId()));
    }

    @GetMapping("/folders/{folderId}")
    public ApiResponse<FolderContentsResponse> getFolderContents(
            @PathVariable UUID classroomId,
            @PathVariable UUID folderId) {
        return ApiResponse.ok(documentService.getFolderContents(classroomId, folderId, SecurityUtils.getCurrentUser().getId()));
    }

    @DeleteMapping("/folders/{folderId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteFolder(@PathVariable UUID classroomId, @PathVariable UUID folderId) {
        documentService.deleteFolder(classroomId, folderId, SecurityUtils.getCurrentUser().getId());
    }

    @PostMapping("/upload")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<DocumentResponse> upload(
            @PathVariable UUID classroomId,
            @RequestParam(required = false) UUID folderId,
            @RequestParam("file") MultipartFile file) {
        return ApiResponse.ok(documentService.uploadDocument(classroomId, folderId, file, SecurityUtils.getCurrentUser().getId()));
    }

    @GetMapping
    public ApiResponse<List<DocumentResponse>> listDocuments(
            @PathVariable UUID classroomId,
            @RequestParam(required = false) UUID folderId) {
        return ApiResponse.ok(documentService.listDocuments(classroomId, folderId, SecurityUtils.getCurrentUser().getId()));
    }

    @DeleteMapping("/{documentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDocument(@PathVariable UUID classroomId, @PathVariable UUID documentId) {
        documentService.deleteDocument(classroomId, documentId, SecurityUtils.getCurrentUser().getId());
    }

    @GetMapping("/{documentId}/content")
    public ResponseEntity<Resource> download(
            @PathVariable UUID classroomId,
            @PathVariable UUID documentId,
            @RequestParam(defaultValue = "false") boolean inline) {
        Document doc = documentService.getDocumentForDownload(
                classroomId, documentId, SecurityUtils.getCurrentUser().getId());
        Resource resource = new FileSystemResource(Path.of(doc.getFilePath()));
        MediaType mediaType = doc.getContentType() != null
                ? MediaType.parseMediaType(doc.getContentType())
                : MediaType.APPLICATION_OCTET_STREAM;
        String encodedName = URLEncoder.encode(doc.getName(), StandardCharsets.UTF_8).replace("+", "%20");
        String disposition = (inline ? "inline" : "attachment") +
                "; filename=\"" + doc.getName() + "\"; filename*=UTF-8''" + encodedName;
        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition)
                .contentLength(doc.getFileSize())
                .body(resource);
    }
}
