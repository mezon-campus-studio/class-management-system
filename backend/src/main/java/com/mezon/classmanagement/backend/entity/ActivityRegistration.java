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
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Entity
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "activity_registrations")
public class ActivityRegistration {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "activity_id", nullable = false)
	Activity activity;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "registered_user_id", nullable = false)
	User registered;

	@Column(name = "proof_image_url", nullable = true)
	String proofImageUrl;

	@Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false)
	Status status;

	@PrePersist
	public void prePersist() {
		if (status == null) {
			status = Status.PENDING;
		}
	}

	@Column(name = "registered_at", nullable = false, insertable = false, updatable = false)
	Instant registeredAt;

	public enum Status {
		APPROVED,
		REJECTED,
		PENDING
	}
}