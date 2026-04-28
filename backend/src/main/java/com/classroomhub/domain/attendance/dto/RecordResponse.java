package com.classroomhub.domain.attendance.dto;

import com.classroomhub.domain.attendance.entity.AttendanceRecord;

import java.time.Instant;
import java.util.UUID;

public record RecordResponse(
        UUID id,
        UUID sessionId,
        UUID userId,
        String displayName,
        String avatarUrl,
        AttendanceRecord.Status status,
        String note,
        UUID reviewedBy,
        Instant reviewedAt,
        Instant checkedInAt
) {
    public static RecordResponse from(AttendanceRecord r, String displayName, String avatarUrl) {
        return new RecordResponse(
                r.getId(), r.getSessionId(), r.getUserId(),
                displayName, avatarUrl, r.getStatus(), r.getNote(),
                r.getReviewedBy(), r.getReviewedAt(), r.getCheckedInAt()
        );
    }
}
