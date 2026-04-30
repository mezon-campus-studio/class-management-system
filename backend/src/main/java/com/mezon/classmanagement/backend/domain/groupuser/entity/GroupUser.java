package com.mezon.classmanagement.backend.domain.groupuser.entity;

import com.mezon.classmanagement.backend.domain.auth.entity.User;
import com.mezon.classmanagement.backend.domain.clazz.entity.Class;
import com.mezon.classmanagement.backend.domain.group.entity.Group;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Entity
@FieldDefaults(level = AccessLevel.PRIVATE)
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "group_users", uniqueConstraints = @UniqueConstraint(columnNames = {"class_id", "group_id", "user_id"}))
public class GroupUser {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false)
	Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "class_id", nullable = false)
	Class clazz;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "group_id", nullable = false)
	Group group;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	User user;

	@Enumerated(EnumType.STRING)
	@Column(name = "role", nullable = false)
	Role role;

	@Column(name = "desk", nullable = true)
	Short desk;

	@Column(name = "desk_position", nullable = true)
	Short deskPosition;

	@Column(name = "joined_at", nullable = false, insertable = false, updatable = false)
	Instant joinedAt;

	public enum Role {
		GROUP_LEADER,
		GROUP_MEMBER
	}

	@PrePersist
	public void prePersist() {
		if (role == null) {
			role = Role.GROUP_MEMBER;
		}
	}
}