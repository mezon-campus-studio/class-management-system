package com.classroomhub.domain.attendance.repository;

import com.classroomhub.domain.attendance.entity.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, UUID> {

    List<AttendanceRecord> findAllBySessionId(UUID sessionId);

    boolean existsBySessionIdAndUserId(UUID sessionId, UUID userId);

    Optional<AttendanceRecord> findBySessionIdAndUserId(UUID sessionId, UUID userId);

    List<AttendanceRecord> findAllBySessionIdIn(List<UUID> sessionIds);
}
