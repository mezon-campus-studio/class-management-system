package com.classroomhub.domain.attendance.repository;

import com.classroomhub.domain.attendance.entity.AttendanceSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, UUID> {
    Page<AttendanceSession> findAllByClassroomIdOrderByCreatedAtDesc(UUID classroomId, Pageable pageable);

    @Query("SELECT s FROM AttendanceSession s WHERE s.classroomId = :classroomId " +
            "AND s.createdAt >= :from ORDER BY s.createdAt DESC LIMIT 1")
    Optional<AttendanceSession> findLatestSince(UUID classroomId, Instant from);

    List<AttendanceSession> findAllByClassroomIdAndSessionDateOrderByPeriodNumberAsc(
            UUID classroomId, LocalDate sessionDate);

    boolean existsByClassroomIdAndSessionDateAndPeriodNumber(
            UUID classroomId, LocalDate sessionDate, Integer periodNumber);

    List<AttendanceSession> findAllByStatusAndClosesAtBefore(
            AttendanceSession.Status status, Instant before);

    List<AttendanceSession> findAllByStatusAndStartsAtLessThanEqual(
            AttendanceSession.Status status, Instant at);
}
