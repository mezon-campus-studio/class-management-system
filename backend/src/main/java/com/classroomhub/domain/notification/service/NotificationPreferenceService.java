package com.classroomhub.domain.notification.service;

import com.classroomhub.domain.notification.dto.NotificationPreferencesResponse;
import com.classroomhub.domain.notification.dto.PreferenceEntryDto;
import com.classroomhub.domain.notification.dto.UpdatePreferencesRequest;
import com.classroomhub.domain.notification.entity.Notification;
import com.classroomhub.domain.notification.entity.NotificationPreference;
import com.classroomhub.domain.notification.repository.NotificationPreferenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationPreferenceService {

    private final NotificationPreferenceRepository preferenceRepository;

    @Transactional(readOnly = true)
    public NotificationPreferencesResponse getPreferences(UUID userId) {
        List<NotificationPreference> all = preferenceRepository.findByUserId(userId);

        PreferenceEntryDto global = all.stream()
                .filter(p -> p.getClassroomId() == null)
                .findFirst()
                .map(this::toDto)
                .orElse(defaultGlobalDto());

        List<PreferenceEntryDto> classrooms = all.stream()
                .filter(p -> p.getClassroomId() != null)
                .map(this::toDto)
                .toList();

        return new NotificationPreferencesResponse(global, classrooms);
    }

    public NotificationPreferencesResponse updatePreferences(UUID userId, UpdatePreferencesRequest req) {
        // Upsert global preference
        if (req.global() != null) {
            NotificationPreference global = preferenceRepository
                    .findByUserIdAndClassroomIdIsNull(userId)
                    .orElse(NotificationPreference.builder().userId(userId).build());
            applyDto(global, req.global());
            preferenceRepository.save(global);
        }

        // Upsert each classroom preference
        if (req.classrooms() != null) {
            for (PreferenceEntryDto entry : req.classrooms()) {
                if (entry.classroomId() == null) continue;
                NotificationPreference pref = preferenceRepository
                        .findByUserIdAndClassroomId(userId, entry.classroomId())
                        .orElse(NotificationPreference.builder()
                                .userId(userId)
                                .classroomId(entry.classroomId())
                                .build());
                applyDto(pref, entry);
                preferenceRepository.save(pref);
            }
        }

        return getPreferences(userId);
    }

    @Transactional(readOnly = true)
    public NotificationPreference.ChatLevel getChatLevel(UUID userId, UUID classroomId) {
        if (classroomId != null) {
            Optional<NotificationPreference> classroomPref =
                    preferenceRepository.findByUserIdAndClassroomId(userId, classroomId);
            if (classroomPref.isPresent()) {
                return classroomPref.get().getChatLevel();
            }
        }
        return preferenceRepository.findByUserIdAndClassroomIdIsNull(userId)
                .map(NotificationPreference::getChatLevel)
                .orElse(NotificationPreference.ChatLevel.ALL);
    }

    @Transactional(readOnly = true)
    public boolean isEnabled(UUID userId, UUID classroomId, Notification.Type type) {
        // GENERAL, ABSENCE_REQUEST_*, MESSAGE_MENTION are always enabled
        if (type == Notification.Type.GENERAL
                || type == Notification.Type.ABSENCE_REQUEST_REVIEWED
                || type == Notification.Type.ABSENCE_REQUEST_PENDING
                || type == Notification.Type.MESSAGE_MENTION) {
            return true;
        }

        // Try classroom-specific pref first, fall back to global
        NotificationPreference pref = null;
        if (classroomId != null) {
            pref = preferenceRepository.findByUserIdAndClassroomId(userId, classroomId).orElse(null);
        }
        if (pref == null) {
            pref = preferenceRepository.findByUserIdAndClassroomIdIsNull(userId).orElse(null);
        }
        // If no preference row exists at all, default is enabled
        if (pref == null) return true;

        return switch (type) {
            case DUTY_ASSIGNED, DUTY_CONFIRMED, DUTY_REMINDER -> pref.isDutyEnabled();
            case EVENT_CREATED, EVENT_REMINDER -> pref.isEventEnabled();
            case ATTENDANCE_PENDING, ATTENDANCE_APPROVED, ATTENDANCE_REJECTED -> pref.isAttendanceEnabled();
            case FUND_PAYMENT_CONFIRMED, FUND_COLLECTION_CREATED -> pref.isFundEnabled();
            case EMULATION_ENTRY_ADDED, EVALUATION_ADDED -> pref.isEvaluationEnabled();
            // GENERAL, ABSENCE_REQUEST_*, MESSAGE_MENTION already handled above
            default -> true;
        };
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────────

    private PreferenceEntryDto toDto(NotificationPreference p) {
        return new PreferenceEntryDto(
                p.getClassroomId(),
                p.getChatLevel(),
                p.isDutyEnabled(),
                p.isEventEnabled(),
                p.isAttendanceEnabled(),
                p.isFundEnabled(),
                p.isEvaluationEnabled()
        );
    }

    private PreferenceEntryDto defaultGlobalDto() {
        return new PreferenceEntryDto(
                null,
                NotificationPreference.ChatLevel.ALL,
                true, true, true, true, true
        );
    }

    private void applyDto(NotificationPreference pref, PreferenceEntryDto dto) {
        if (dto.chatLevel() != null) pref.setChatLevel(dto.chatLevel());
        pref.setDutyEnabled(dto.dutyEnabled());
        pref.setEventEnabled(dto.eventEnabled());
        pref.setAttendanceEnabled(dto.attendanceEnabled());
        pref.setFundEnabled(dto.fundEnabled());
        pref.setEvaluationEnabled(dto.evaluationEnabled());
    }
}
