package com.classroomhub.domain.document.service;

import com.classroomhub.common.exception.BusinessException;
import com.classroomhub.common.exception.ErrorCode;
import com.classroomhub.domain.classroom.entity.ClassroomMember;
import com.classroomhub.domain.classroom.service.ClassroomService;

import com.classroomhub.domain.document.dto.CreateFolderRequest;
import com.classroomhub.domain.document.dto.DocumentResponse;
import com.classroomhub.domain.document.dto.FolderContentsResponse;
import com.classroomhub.domain.document.dto.FolderResponse;
import com.classroomhub.domain.document.entity.Document;
import com.classroomhub.domain.document.entity.Folder;
import com.classroomhub.domain.document.repository.DocumentRepository;
import com.classroomhub.domain.document.repository.FolderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class DocumentService {

    private final FolderRepository folderRepository;
    private final DocumentRepository documentRepository;
    private final ClassroomService classroomService;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public FolderResponse createFolder(UUID classroomId, CreateFolderRequest req, UUID userId) {
        classroomService.requireMember(classroomId, userId);
        Folder folder = Folder.builder()
                .classroomId(classroomId)
                .name(req.name())
                .parentId(req.parentId())
                .createdById(userId)
                .build();
        return FolderResponse.from(folderRepository.save(folder));
    }

    @Transactional(readOnly = true)
    public List<FolderResponse> listRootFolders(UUID classroomId, UUID userId) {
        classroomService.requireMember(classroomId, userId);
        return folderRepository.findByClassroomIdAndParentIdIsNull(classroomId)
                .stream().map(FolderResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public FolderContentsResponse getFolderContents(UUID classroomId, UUID folderId, UUID userId) {
        classroomService.requireMember(classroomId, userId);
        Folder folder = folderRepository.findByIdAndClassroomId(folderId, classroomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.FOLDER_NOT_FOUND));
        List<FolderResponse> subFolders = folderRepository
                .findByClassroomIdAndParentId(classroomId, folderId)
                .stream().map(FolderResponse::from).toList();
        List<DocumentResponse> docs = documentRepository
                .findByClassroomIdAndFolderId(classroomId, folderId)
                .stream().map(DocumentResponse::from).toList();
        return new FolderContentsResponse(FolderResponse.from(folder), subFolders, docs);
    }

    public void deleteFolder(UUID classroomId, UUID folderId, UUID userId) {
        classroomService.requireRoleAtLeast(classroomId, userId, ClassroomMember.Role.MONITOR);
        folderRepository.findByIdAndClassroomId(folderId, classroomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.FOLDER_NOT_FOUND));
        folderRepository.deleteById(folderId);
    }

    public DocumentResponse uploadDocument(UUID classroomId, UUID folderId, MultipartFile file, UUID userId) {
        classroomService.requireMember(classroomId, userId);
        if (folderId != null) {
            folderRepository.findByIdAndClassroomId(folderId, classroomId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.FOLDER_NOT_FOUND));
        }
        try {
            Path dir = Paths.get(uploadDir, classroomId.toString());
            Files.createDirectories(dir);
            String storedName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path dest = dir.resolve(storedName);
            file.transferTo(dest);

            Document doc = Document.builder()
                    .classroomId(classroomId)
                    .folderId(folderId)
                    .name(file.getOriginalFilename())
                    .filePath(dest.toString())
                    .contentType(file.getContentType())
                    .fileSize(file.getSize())
                    .uploadedById(userId)
                    .build();
            return DocumentResponse.from(documentRepository.save(doc));
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.UPLOAD_FAILED);
        }
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> listDocuments(UUID classroomId, UUID folderId, UUID userId) {
        classroomService.requireMember(classroomId, userId);
        if (folderId != null) {
            return documentRepository.findByClassroomIdAndFolderId(classroomId, folderId)
                    .stream().map(DocumentResponse::from).toList();
        }
        return documentRepository.findByClassroomIdAndFolderIdIsNull(classroomId)
                .stream().map(DocumentResponse::from).toList();
    }

    public void deleteDocument(UUID classroomId, UUID documentId, UUID userId) {
        classroomService.requireMember(classroomId, userId);
        Document doc = documentRepository.findByIdAndClassroomId(documentId, classroomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.DOCUMENT_NOT_FOUND));
        if (!doc.getUploadedById().equals(userId)) {
            classroomService.requireRoleAtLeast(classroomId, userId, ClassroomMember.Role.MONITOR);
        }
        try {
            Files.deleteIfExists(Paths.get(doc.getFilePath()));
        } catch (IOException ignored) {}
        documentRepository.deleteById(documentId);
    }

    @Transactional(readOnly = true)
    public Document getDocumentForDownload(UUID classroomId, UUID documentId, UUID userId) {
        classroomService.requireMember(classroomId, userId);
        return documentRepository.findByIdAndClassroomId(documentId, classroomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.DOCUMENT_NOT_FOUND));
    }
}
