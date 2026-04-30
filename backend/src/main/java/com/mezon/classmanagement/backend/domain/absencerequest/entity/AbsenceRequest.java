package com.mezon.classmanagement.backend.domain.absencerequest.entity;

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
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
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
@Table(name = "absence_requests", uniqueConstraints = @UniqueConstraint(columnNames = {"class_id", "user_id"}))
public class AbsenceRequest {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "class_id", nullable = false)
	Class clazz;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	User user;

	@Column(name = "reason", nullable = false)
	String reason;

	@FutureOrPresent
	@Column(name = "from", nullable = false)
	Instant from;

	@Future
	@Column(name = "to", nullable = false)
	Instant to;

	@Column(name = "proof_url", nullable = true)
	String proofUrl;

	@Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false)
	Status status;

	@Column(name = "created_at", nullable = false, insertable = false, updatable = false)
	Instant createdAt;

	public enum Status {
		APPROVED,
		REJECTED,
		PENDING
	}

	@PrePersist
	public void prePersist() {
		if (status == null) {
			status = Status.PENDING;
		}
	}

}