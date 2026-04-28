package com.classroomhub.domain.timetable.service;

import com.classroomhub.common.exception.BusinessException;
import com.classroomhub.common.exception.ErrorCode;
import com.classroomhub.domain.auth.entity.User;
import com.classroomhub.domain.auth.repository.UserRepository;
import com.classroomhub.domain.timetable.dto.CreateSwapRequestDto;
import com.classroomhub.domain.timetable.dto.ReviewSwapRequestDto;
import com.classroomhub.domain.timetable.dto.SwapRequestResponse;
import com.classroomhub.domain.timetable.dto.TimetableEntryResponse;
import com.classroomhub.domain.timetable.entity.SwapRequest;
import com.classroomhub.domain.timetable.entity.TimetableEntry;
import com.classroomhub.domain.timetable.repository.SwapRequestRepository;
import com.classroomhub.domain.timetable.repository.TimetableEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SwapRequestService {

    private final SwapRequestRepository swapRepo;
    private final TimetableEntryRepository entryRepo;
    private final UserRepository userRepo;
    private final TimetableService timetableService;

    @Transactional(readOnly = true)
    public List<SwapRequestResponse> getMySwapRequests(UUID userId) {
        return swapRepo.findByRequesterIdOrTargetTeacherIdOrderByCreatedAtDesc(userId, userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public SwapRequestResponse create(UUID requesterId, CreateSwapRequestDto req) {
        // Verify requester entry exists
        if (!entryRepo.existsById(req.requesterEntryId())) {
            throw new BusinessException(ErrorCode.TIMETABLE_ENTRY_NOT_FOUND);
        }

        // Verify no pending swap already exists for this entry
        if (swapRepo.existsByRequesterEntryIdAndStatus(req.requesterEntryId(), SwapRequest.Status.PENDING)) {
            throw new BusinessException(ErrorCode.SWAP_ALREADY_PENDING);
        }

        // Verify target entry if provided
        if (req.targetEntryId() != null) {
            if (!entryRepo.existsById(req.targetEntryId())) {
                throw new BusinessException(ErrorCode.TIMETABLE_ENTRY_NOT_FOUND);
            }
        }

        SwapRequest swap = SwapRequest.builder()
                .requesterId(requesterId)
                .requesterEntryId(req.requesterEntryId())
                .targetTeacherId(req.targetTeacherId())
                .targetEntryId(req.targetEntryId())
                .reason(req.reason())
                .build();

        return toResponse(swapRepo.save(swap));
    }

    public SwapRequestResponse approve(UUID swapId, UUID reviewerId) {
        SwapRequest swap = swapRepo.findById(swapId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SWAP_REQUEST_NOT_FOUND));

        if (swap.getStatus() != SwapRequest.Status.PENDING) {
            throw new BusinessException(ErrorCode.SWAP_NOT_PENDING);
        }

        // Perform the swap: exchange teacherIds between entries
        TimetableEntry requesterEntry = entryRepo.findById(swap.getRequesterEntryId())
                .orElseThrow(() -> new BusinessException(ErrorCode.TIMETABLE_ENTRY_NOT_FOUND));

        if (swap.getTargetEntryId() != null) {
            TimetableEntry targetEntry = entryRepo.findById(swap.getTargetEntryId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.TIMETABLE_ENTRY_NOT_FOUND));

            UUID tempTeacherId = requesterEntry.getTeacherId();
            requesterEntry.setTeacherId(targetEntry.getTeacherId());
            targetEntry.setTeacherId(tempTeacherId);

            entryRepo.save(requesterEntry);
            entryRepo.save(targetEntry);
        } else {
            // No target entry — just assign target teacher to requester entry
            requesterEntry.setTeacherId(swap.getTargetTeacherId());
            entryRepo.save(requesterEntry);
        }

        swap.setStatus(SwapRequest.Status.APPROVED);
        swap.setReviewedById(reviewerId);
        swap.setReviewedAt(Instant.now());

        return toResponse(swapRepo.save(swap));
    }

    public SwapRequestResponse reject(UUID swapId, UUID reviewerId, ReviewSwapRequestDto req) {
        SwapRequest swap = swapRepo.findById(swapId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SWAP_REQUEST_NOT_FOUND));

        if (swap.getStatus() != SwapRequest.Status.PENDING) {
            throw new BusinessException(ErrorCode.SWAP_NOT_PENDING);
        }

        swap.setStatus(SwapRequest.Status.REJECTED);
        swap.setReviewedById(reviewerId);
        swap.setReviewNote(req.reviewNote());
        swap.setReviewedAt(Instant.now());

        return toResponse(swapRepo.save(swap));
    }

    public void cancel(UUID swapId, UUID requesterId) {
        SwapRequest swap = swapRepo.findByIdAndRequesterId(swapId, requesterId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SWAP_REQUEST_NOT_FOUND));

        if (swap.getStatus() != SwapRequest.Status.PENDING) {
            throw new BusinessException(ErrorCode.SWAP_NOT_PENDING);
        }

        swap.setStatus(SwapRequest.Status.CANCELLED);
        swapRepo.save(swap);
    }

    private SwapRequestResponse toResponse(SwapRequest swap) {
        String requesterName = userRepo.findById(swap.getRequesterId())
                .map(User::getDisplayName).orElse(null);
        String targetTeacherName = userRepo.findById(swap.getTargetTeacherId())
                .map(User::getDisplayName).orElse(null);

        TimetableEntryResponse requesterEntry = entryRepo.findById(swap.getRequesterEntryId())
                .map(timetableService::toResponse).orElse(null);

        TimetableEntryResponse targetEntry = swap.getTargetEntryId() != null
                ? entryRepo.findById(swap.getTargetEntryId()).map(timetableService::toResponse).orElse(null)
                : null;

        return new SwapRequestResponse(
                swap.getId(),
                swap.getRequesterId(),
                requesterName,
                requesterEntry,
                swap.getTargetTeacherId(),
                targetTeacherName,
                targetEntry,
                swap.getStatus().name(),
                swap.getReason(),
                swap.getReviewedById(),
                swap.getReviewNote(),
                swap.getReviewedAt(),
                swap.getCreatedAt()
        );
    }
}
