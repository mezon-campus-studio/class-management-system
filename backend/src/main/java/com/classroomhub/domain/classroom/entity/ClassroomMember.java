package com.classroomhub.domain.classroom.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "classroom_members",
        uniqueConstraints = @UniqueConstraint(columnNames = {"classroom_id", "user_id"}))
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassroomMember {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "classroom_id", nullable = false)
    private UUID classroomId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "display_name")
    private String displayName;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Role role = Role.MEMBER;

    /** Secondary roles a member holds (e.g. a lớp trưởng who is also tổ trưởng). */
    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(
            name = "classroom_member_extra_roles",
            joinColumns = @JoinColumn(name = "member_id")
    )
    @Column(name = "role", length = 40, nullable = false)
    @Builder.Default
    private Set<Role> extraRoles = new HashSet<>();

    /** Fine-grained permissions explicitly delegated by a teacher. */
    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(
            name = "classroom_member_permissions",
            joinColumns = @JoinColumn(name = "member_id")
    )
    @Column(name = "permission", length = 60, nullable = false)
    @Builder.Default
    private Set<DelegatedPermission> delegatedPermissions = new HashSet<>();

    @CreatedDate
    @Column(name = "joined_at", nullable = false, updatable = false)
    private Instant joinedAt;

    public enum Role {
        OWNER,
        TEACHER,
        MONITOR,                 // Lớp trưởng
        VICE_MONITOR,            // Lớp phó (chung)
        STUDY_VICE_MONITOR,      // Lớp phó học tập
        ARTS_VICE_MONITOR,       // Lớp phó văn thể mỹ
        LABOR_VICE_MONITOR,      // Lớp phó lao động
        DISCIPLINE_OFFICER,      // Sao đỏ
        GROUP_LEADER,            // Tổ trưởng
        TREASURER,               // Thủ quỹ
        SECRETARY,               // Thư ký
        MEMBER
    }

    public enum DelegatedPermission {
        MANAGE_EMULATION_CATEGORIES,
        MANAGE_EMULATION_ENTRIES,
        MANAGE_DUTY_TYPES,
        MANAGE_DUTY_ASSIGNMENTS,
        /** Tạo đợt thu, xác nhận thanh toán, ghi chi phí, cập nhật thông tin ngân hàng. */
        MANAGE_FUND
    }
}
