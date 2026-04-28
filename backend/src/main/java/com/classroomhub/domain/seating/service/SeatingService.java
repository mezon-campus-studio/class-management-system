package com.classroomhub.domain.seating.service;

import com.classroomhub.common.exception.BusinessException;
import com.classroomhub.common.exception.ErrorCode;
import com.classroomhub.domain.attendance.entity.AttendanceRecord;
import com.classroomhub.domain.attendance.entity.AttendanceSession;
import com.classroomhub.domain.attendance.repository.AttendanceRecordRepository;
import com.classroomhub.domain.attendance.repository.AttendanceSessionRepository;
import com.classroomhub.domain.auth.entity.User;
import com.classroomhub.domain.auth.repository.UserRepository;
import com.classroomhub.domain.classroom.entity.ClassroomMember;
import com.classroomhub.domain.classroom.service.ClassroomService;
import com.classroomhub.domain.seating.dto.SeatAssignment;
import com.classroomhub.domain.seating.dto.SeatingResponse;
import com.classroomhub.domain.seating.dto.UpdateSeatingRequest;
import com.classroomhub.domain.seating.entity.SeatingChart;
import com.classroomhub.domain.seating.repository.SeatingChartRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class SeatingService {

    private final SeatingChartRepository seatingChartRepository;
    private final ClassroomService classroomService;
    private final UserRepository userRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRecordRepository recordRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SeatingResponse getSeating(UUID classroomId, UUID userId) {
        classroomService.requireMember(classroomId, userId);
        SeatingChart chart = seatingChartRepository.findById(classroomId)
                .orElseGet(() -> defaultChart(classroomId));
        Map<String, UUID> assignments = parseAssignments(chart.getLayoutJson());

        Map<UUID, AttendanceRecord.Status> statusByUser = computeTodayAttendance(classroomId);
        Map<UUID, User> userById = loadUsers(assignments.values());

        List<SeatAssignment> seats = new ArrayList<>(assignments.size());
        int present = 0, excused = 0, absent = 0, unmarked = 0;
        for (Map.Entry<String, UUID> e : assignments.entrySet()) {
            User u = userById.get(e.getValue());
            if (u == null) continue; // assigned user removed — skip
            String status = mapStatus(statusByUser.get(u.getId()));
            switch (status) {
                case "PRESENT"  -> present++;
                case "EXCUSED"  -> excused++;
                case "ABSENT"   -> absent++;
                default         -> unmarked++;
            }
            seats.add(new SeatAssignment(e.getKey(), u.getId(), u.getDisplayName(), u.getAvatarUrl(), status));
        }

        return new SeatingResponse(
                chart.getRowsCount(),
                chart.getSeatsPerSide(),
                seats,
                new SeatingResponse.Stats(seats.size(), present, excused, absent, unmarked));
    }

    @Transactional
    public SeatingResponse updateSeating(UUID classroomId, UUID userId, UpdateSeatingRequest req) {
        classroomService.requireRoleAtLeast(classroomId, userId, ClassroomMember.Role.TEACHER);
        SeatingChart chart = seatingChartRepository.findById(classroomId)
                .orElseGet(() -> defaultChart(classroomId));

        if (req.rowsCount() != null && req.rowsCount() > 0) {
            chart.setRowsCount(Math.min(req.rowsCount(), 20));
        }
        if (req.seatsPerSide() != null && req.seatsPerSide() > 0) {
            chart.setSeatsPerSide(Math.min(req.seatsPerSide(), 10));
        }
        if (req.assignments() != null) {
            Map<String, UUID> filtered = new HashMap<>();
            for (Map.Entry<String, UUID> e : req.assignments().entrySet()) {
                if (e.getValue() != null) filtered.put(e.getKey(), e.getValue());
            }
            try {
                chart.setLayoutJson(objectMapper.writeValueAsString(Map.of("assignments", filtered)));
            } catch (Exception ex) {
                throw new BusinessException(ErrorCode.INTERNAL_ERROR);
            }
        }
        seatingChartRepository.save(chart);
        return getSeating(classroomId, userId);
    }

    // ─── Helpers ────────────────────────────────────────────────────────────────

    private SeatingChart defaultChart(UUID classroomId) {
        return SeatingChart.builder()
                .classroomId(classroomId)
                .rowsCount(6)
                .seatsPerSide(2)
                .layoutJson("{}")
                .build();
    }

    private Map<String, UUID> parseAssignments(String json) {
        if (json == null || json.isBlank()) return Map.of();
        try {
            Map<String, Object> root = objectMapper.readValue(json, new TypeReference<>() {});
            Object a = root.get("assignments");
            if (!(a instanceof Map<?, ?> raw)) return Map.of();
            Map<String, UUID> out = new HashMap<>();
            for (Map.Entry<?, ?> e : raw.entrySet()) {
                if (e.getKey() == null || e.getValue() == null) continue;
                try {
                    out.put(e.getKey().toString(), UUID.fromString(e.getValue().toString()));
                } catch (IllegalArgumentException ignored) {}
            }
            return out;
        } catch (Exception ex) {
            return Map.of();
        }
    }

    private Map<UUID, User> loadUsers(Iterable<UUID> ids) {
        List<UUID> list = new ArrayList<>();
        ids.forEach(list::add);
        Map<UUID, User> map = new HashMap<>();
        userRepository.findAllById(list).forEach(u -> map.put(u.getId(), u));
        return map;
    }

    /** Latest attendance session for the classroom today → record.status by userId. */
    private Map<UUID, AttendanceRecord.Status> computeTodayAttendance(UUID classroomId) {
        Instant startOfDay = Instant.now().atZone(ZoneId.systemDefault())
                .toLocalDate().atStartOfDay(ZoneId.systemDefault()).toInstant();
        AttendanceSession latest = sessionRepository.findLatestSince(classroomId, startOfDay).orElse(null);
        if (latest == null) return Map.of();
        Map<UUID, AttendanceRecord.Status> map = new HashMap<>();
        recordRepository.findAllBySessionId(latest.getId())
                .forEach(r -> map.put(r.getUserId(), r.getStatus()));
        return map;
    }

    private static String mapStatus(AttendanceRecord.Status s) {
        if (s == null) return "UNMARKED";
        return switch (s) {
            case PRESENT, LATE -> "PRESENT";
            case EXCUSED       -> "EXCUSED";
            case ABSENT        -> "ABSENT";
        };
    }
}
