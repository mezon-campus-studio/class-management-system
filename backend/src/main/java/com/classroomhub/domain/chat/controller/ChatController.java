package com.classroomhub.domain.chat.controller;

import com.classroomhub.common.response.ApiResponse;
import com.classroomhub.common.security.SecurityUtils;
import com.classroomhub.domain.chat.dto.ConversationResponse;
import com.classroomhub.domain.chat.dto.ConversationSettingsResponse;
import com.classroomhub.domain.chat.dto.MessageResponse;
import com.classroomhub.domain.chat.dto.SendMessageRequest;
import com.classroomhub.domain.chat.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLConnection;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/classrooms/{classroomId}/chat")
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @GetMapping("/conversations")
    public ApiResponse<List<ConversationResponse>> listConversations(@PathVariable UUID classroomId) {
        return ApiResponse.ok(chatService.listConversations(classroomId, SecurityUtils.getCurrentUser().getId()));
    }

    @GetMapping("/conversations/class")
    public ApiResponse<ConversationResponse> getClassConversation(@PathVariable UUID classroomId) {
        return ApiResponse.ok(chatService.getOrCreateClassConversation(classroomId, SecurityUtils.getCurrentUser().getId()));
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ApiResponse<Page<MessageResponse>> getMessages(
            @PathVariable UUID classroomId,
            @PathVariable UUID conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        return ApiResponse.ok(chatService.getMessages(classroomId, conversationId, page, size,
                SecurityUtils.getCurrentUser().getId()));
    }

    @PostMapping("/conversations/{conversationId}/messages")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<MessageResponse> sendMessage(
            @PathVariable UUID classroomId,
            @PathVariable UUID conversationId,
            @Valid @RequestBody SendMessageRequest req) {
        return ApiResponse.ok(chatService.sendMessage(classroomId, conversationId, req,
                SecurityUtils.getCurrentUser().getId()));
    }

    @DeleteMapping("/conversations/{conversationId}/messages/{messageId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMessage(
            @PathVariable UUID classroomId,
            @PathVariable UUID conversationId,
            @PathVariable UUID messageId) {
        chatService.deleteMessage(classroomId, conversationId, messageId, SecurityUtils.getCurrentUser().getId());
    }

    @PostMapping("/conversations/{conversationId}/attachments")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ChatService.ChatAttachment> uploadAttachment(
            @PathVariable UUID classroomId,
            @PathVariable UUID conversationId,
            @RequestParam("file") MultipartFile file) {
        return ApiResponse.ok(chatService.uploadAttachment(
                classroomId, conversationId, file, SecurityUtils.getCurrentUser().getId()));
    }

    // ─── Pin / Unpin ──────────────────────────────────────────────────────────

    @GetMapping("/conversations/{conversationId}/pinned")
    public ApiResponse<List<MessageResponse>> listPinned(
            @PathVariable UUID classroomId,
            @PathVariable UUID conversationId) {
        return ApiResponse.ok(chatService.getPinnedMessages(
                classroomId, conversationId, SecurityUtils.getCurrentUser().getId()));
    }

    @PostMapping("/conversations/{conversationId}/messages/{messageId}/pin")
    public ApiResponse<MessageResponse> pinMessage(
            @PathVariable UUID classroomId,
            @PathVariable UUID conversationId,
            @PathVariable UUID messageId) {
        return ApiResponse.ok(chatService.pinMessage(
                classroomId, conversationId, messageId, SecurityUtils.getCurrentUser().getId()));
    }

    @DeleteMapping("/conversations/{conversationId}/messages/{messageId}/pin")
    public ApiResponse<MessageResponse> unpinMessage(
            @PathVariable UUID classroomId,
            @PathVariable UUID conversationId,
            @PathVariable UUID messageId) {
        return ApiResponse.ok(chatService.unpinMessage(
                classroomId, conversationId, messageId, SecurityUtils.getCurrentUser().getId()));
    }

    // ─── Reactions ────────────────────────────────────────────────────────────

    @PostMapping("/conversations/{conversationId}/messages/{messageId}/reactions")
    public ApiResponse<MessageResponse> addReaction(
            @PathVariable UUID classroomId,
            @PathVariable UUID conversationId,
            @PathVariable UUID messageId,
            @RequestBody ReactionRequest req) {
        return ApiResponse.ok(chatService.addReaction(
                classroomId, conversationId, messageId, req.emoji(),
                SecurityUtils.getCurrentUser().getId()));
    }

    @DeleteMapping("/conversations/{conversationId}/messages/{messageId}/reactions")
    public ApiResponse<MessageResponse> removeReaction(
            @PathVariable UUID classroomId,
            @PathVariable UUID conversationId,
            @PathVariable UUID messageId,
            @RequestParam String emoji) {
        return ApiResponse.ok(chatService.removeReaction(
                classroomId, conversationId, messageId, emoji,
                SecurityUtils.getCurrentUser().getId()));
    }

    public record ReactionRequest(String emoji) {}

    // ─── Settings ─────────────────────────────────────────────────────────────

    @GetMapping("/conversations/{conversationId}/settings")
    public ApiResponse<ConversationSettingsResponse> getSettings(
            @PathVariable UUID classroomId,
            @PathVariable UUID conversationId) {
        return ApiResponse.ok(chatService.getSettings(
                classroomId, conversationId, SecurityUtils.getCurrentUser().getId()));
    }

    @PutMapping("/conversations/{conversationId}/settings")
    public ApiResponse<ConversationSettingsResponse> saveSettings(
            @PathVariable UUID classroomId,
            @PathVariable UUID conversationId,
            @RequestBody SaveSettingsRequest req) {
        return ApiResponse.ok(chatService.saveSettings(
                classroomId, conversationId, SecurityUtils.getCurrentUser().getId(),
                req.bubbleColor(), req.wallpaper()));
    }

    public record SaveSettingsRequest(String bubbleColor, String wallpaper) {}

    @GetMapping("/conversations/{conversationId}/attachments/{storedName}")
    public ResponseEntity<Resource> downloadAttachment(
            @PathVariable UUID classroomId,
            @PathVariable UUID conversationId,
            @PathVariable String storedName,
            @RequestParam(defaultValue = "true") boolean inline) {
        Path file = chatService.resolveAttachment(classroomId, conversationId, storedName,
                SecurityUtils.getCurrentUser().getId());

        String guessed = URLConnection.guessContentTypeFromName(file.getFileName().toString());
        MediaType mediaType = guessed != null
                ? MediaType.parseMediaType(guessed)
                : MediaType.APPLICATION_OCTET_STREAM;

        // storedName format: <uuid>_<originalName>; expose the original name in download header
        String displayName = storedName.contains("_")
                ? storedName.substring(storedName.indexOf('_') + 1)
                : storedName;
        String encoded = URLEncoder.encode(displayName, StandardCharsets.UTF_8).replace("+", "%20");
        String disposition = (inline ? "inline" : "attachment")
                + "; filename=\"" + displayName + "\"; filename*=UTF-8''" + encoded;

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition)
                .body(new FileSystemResource(file));
    }
}
