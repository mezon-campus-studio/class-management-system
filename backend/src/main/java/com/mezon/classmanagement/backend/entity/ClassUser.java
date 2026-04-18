package com.mezon.classmanagement.backend.entity;

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
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.List;

@Entity
@FieldDefaults(level = AccessLevel.PRIVATE)
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "class_users", uniqueConstraints = @UniqueConstraint(columnNames = {"class_id", "user_id"}))
public class ClassUser {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false)
	Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "class_id", nullable = false)
	Class clazz;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	User user;

	@Enumerated(EnumType.STRING)
	@Column(name = "role", nullable = false)
	Role role;

	@PrePersist
	public void prePersist() {
		if (role == null) {
			role = Role.CLASS_MEMBER;
		}
	}

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "json", nullable = false)
	List<String> permissionCodes;

	@Column(name = "joined_at", nullable = false, insertable = false, updatable = false)
	Instant joinedAt;

	public enum Role {
		CLASS_ADMIN,
		CLASS_MEMBER
	}
}