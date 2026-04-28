package com.classroomhub.domain.notification.repository;

import com.classroomhub.domain.notification.entity.NotificationPreference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, UUID> {

    Optional<NotificationPreference> findByUserIdAndClassroomIdIsNull(UUID userId);

    Optional<NotificationPreference> findByUserIdAndClassroomId(UUID userId, UUID classroomId);

    List<NotificationPreference> findByUserId(UUID userId);

    void deleteByUserIdAndClassroomId(UUID userId, UUID classroomId);
}
