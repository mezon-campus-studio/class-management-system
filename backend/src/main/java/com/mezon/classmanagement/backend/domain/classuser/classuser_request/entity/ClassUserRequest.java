package com.mezon.classmanagement.backend.domain.classuser.classuser_request.entity;

import com.mezon.classmanagement.backend.domain.auth.entity.User;
import com.mezon.classmanagement.backend.domain.clazz.entity.Class;
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
@Table(name = "classuser_requests")
public class ClassUserRequest {
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
	@Column(name = "status", nullable = false)
	Status status;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "actor_user_id", nullable = true)
	User actor;

	@Column(name = "acted_at", nullable = true)
	Instant actedAt;

	@Column(name = "created_at", nullable = false, insertable = false, updatable = false)
	Instant createdAt;

	public enum Status {
		APPROVED,
		REJECTED,
		PENDING,
		CANCELLED
	}

	@PrePersist
	public void prePersist() {
		if (status == null) {
			status = Status.PENDING;
		}
	}
}