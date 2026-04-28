package com.classroomhub.domain.emulation.service;

import com.classroomhub.common.exception.BusinessException;
import com.classroomhub.common.exception.ErrorCode;
import com.classroomhub.domain.classroom.entity.ClassroomMember;
import com.classroomhub.domain.classroom.service.ClassroomService;
import com.classroomhub.domain.emulation.dto.*;
import com.classroomhub.domain.emulation.entity.EmulationCategory;
import com.classroomhub.domain.emulation.entity.EmulationEntry;
import com.classroomhub.domain.emulation.repository.EmulationCategoryRepository;
import com.classroomhub.domain.emulation.repository.EmulationEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EmulationService {

    private final EmulationCategoryRepository categoryRepository;
    private final EmulationEntryRepository entryRepository;
    private final ClassroomService classroomService;

    public CategoryResponse createCategory(UUID classroomId, CreateCategoryRequest req, UUID userId) {
        classroomService.requirePermission(classroomId, userId, ClassroomMember.DelegatedPermission.MANAGE_EMULATION_CATEGORIES);

        EmulationCategory category = EmulationCategory.builder()
                .classroomId(classroomId)
                .name(req.name())
                .description(req.description())
                .defaultScore(req.defaultScore())
                .build();
        categoryRepository.save(category);
        return toCategoryResponse(category);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> listCategories(UUID classroomId, UUID userId) {
        classroomService.requireMember(classroomId, userId);
        return categoryRepository.findByClassroomId(classroomId).stream()
                .map(this::toCategoryResponse)
                .toList();
    }

    public CategoryResponse updateCategory(UUID classroomId, UUID categoryId, UpdateCategoryRequest req, UUID userId) {
        classroomService.requirePermission(classroomId, userId, ClassroomMember.DelegatedPermission.MANAGE_EMULATION_CATEGORIES);

        EmulationCategory category = categoryRepository.findByIdAndClassroomId(categoryId, classroomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.EMULATION_CATEGORY_NOT_FOUND));

        if (req.name() != null) category.setName(req.name());
        if (req.description() != null) category.setDescription(req.description());
        category.setDefaultScore(req.defaultScore());
        category.setActive(req.active());
        categoryRepository.save(category);
        return toCategoryResponse(category);
    }

    public void deleteCategory(UUID classroomId, UUID categoryId, UUID userId) {
        classroomService.requirePermission(classroomId, userId, ClassroomMember.DelegatedPermission.MANAGE_EMULATION_CATEGORIES);

        EmulationCategory category = categoryRepository.findByIdAndClassroomId(categoryId, classroomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.EMULATION_CATEGORY_NOT_FOUND));
        categoryRepository.delete(category);
    }

    public EntryResponse addEntry(UUID classroomId, AddEntryRequest req, UUID userId) {
        classroomService.requirePermission(classroomId, userId, ClassroomMember.DelegatedPermission.MANAGE_EMULATION_ENTRIES);

        EmulationCategory category = categoryRepository.findByIdAndClassroomId(req.categoryId(), classroomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.EMULATION_CATEGORY_NOT_FOUND));

        int score = req.score() != 0 ? req.score() : category.getDefaultScore();
        Instant occurredAt = req.occurredAt() != null ? req.occurredAt() : Instant.now();

        EmulationEntry entry = EmulationEntry.builder()
                .categoryId(category.getId())
                .classroomId(classroomId)
                .memberId(req.memberId())
                .score(score)
                .note(req.note())
                .recordedById(userId)
                .occurredAt(occurredAt)
                .build();
        entryRepository.save(entry);
        return toEntryResponse(entry, category.getName());
    }

    public EntryResponse updateEntry(UUID classroomId, UUID entryId, UpdateEntryRequest req, UUID userId) {
        EmulationEntry entry = entryRepository.findById(entryId)
                .filter(e -> e.getClassroomId().equals(classroomId))
                .orElseThrow(() -> new BusinessException(ErrorCode.EMULATION_ENTRY_NOT_FOUND));

        // Only the recorder or someone with MANAGE permission can edit.
        if (!entry.getRecordedById().equals(userId)) {
            classroomService.requirePermission(classroomId, userId, ClassroomMember.DelegatedPermission.MANAGE_EMULATION_ENTRIES);
        } else {
            classroomService.requireMember(classroomId, userId);
        }

        String categoryName;
        if (req.categoryId() != null && !req.categoryId().equals(entry.getCategoryId())) {
            EmulationCategory cat = categoryRepository.findByIdAndClassroomId(req.categoryId(), classroomId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.EMULATION_CATEGORY_NOT_FOUND));
            entry.setCategoryId(cat.getId());
            categoryName = cat.getName();
        } else {
            categoryName = categoryRepository.findById(entry.getCategoryId())
                    .map(EmulationCategory::getName).orElse("");
        }
        if (req.score() != null) entry.setScore(req.score());
        if (req.note() != null) entry.setNote(req.note().isEmpty() ? null : req.note());
        if (req.occurredAt() != null) entry.setOccurredAt(req.occurredAt());

        entryRepository.save(entry);
        return toEntryResponse(entry, categoryName);
    }

    public void deleteEntry(UUID classroomId, UUID entryId, UUID userId) {
        EmulationEntry entry = entryRepository.findById(entryId)
                .filter(e -> e.getClassroomId().equals(classroomId))
                .orElseThrow(() -> new BusinessException(ErrorCode.EMULATION_ENTRY_NOT_FOUND));
        if (!entry.getRecordedById().equals(userId)) {
            classroomService.requirePermission(classroomId, userId, ClassroomMember.DelegatedPermission.MANAGE_EMULATION_ENTRIES);
        } else {
            classroomService.requireMember(classroomId, userId);
        }
        entryRepository.delete(entry);
    }

    @Transactional(readOnly = true)
    public List<EntryResponse> listEntries(UUID classroomId, UUID userId) {
        classroomService.requireMember(classroomId, userId);

        Map<UUID, String> categoryNames = categoryRepository.findByClassroomId(classroomId).stream()
                .collect(Collectors.toMap(EmulationCategory::getId, EmulationCategory::getName));

        return entryRepository.findByClassroomId(classroomId).stream()
                .map(e -> toEntryResponse(e, categoryNames.getOrDefault(e.getCategoryId(), "")))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EntryResponse> listEntriesByMember(UUID classroomId, UUID memberId, UUID userId) {
        classroomService.requireMember(classroomId, userId);

        Map<UUID, String> categoryNames = categoryRepository.findByClassroomId(classroomId).stream()
                .collect(Collectors.toMap(EmulationCategory::getId, EmulationCategory::getName));

        return entryRepository.findByClassroomIdAndMemberId(classroomId, memberId).stream()
                .map(e -> toEntryResponse(e, categoryNames.getOrDefault(e.getCategoryId(), "")))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MemberScoreSummary> getScoreSummary(UUID classroomId, UUID userId) {
        classroomService.requireMember(classroomId, userId);

        return entryRepository.sumScoreByMember(classroomId).stream()
                .map(row -> new MemberScoreSummary((UUID) row[0], ((Number) row[1]).longValue()))
                .toList();
    }

    private CategoryResponse toCategoryResponse(EmulationCategory c) {
        return new CategoryResponse(c.getId(), c.getName(), c.getDescription(), c.getDefaultScore(), c.isActive());
    }

    private EntryResponse toEntryResponse(EmulationEntry e, String categoryName) {
        return new EntryResponse(
                e.getId(),
                e.getCategoryId(),
                categoryName,
                e.getMemberId(),
                e.getScore(),
                e.getNote(),
                e.getRecordedById(),
                e.getOccurredAt(),
                e.getCreatedAt()
        );
    }
}
