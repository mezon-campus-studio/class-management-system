package com.mezon.classmanagement.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "activities")
public class Activity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "class_id", nullable = false)
	Class clazz;

	@Column(name = "name", nullable = false)
	String name;

	@Column(name = "description", nullable = true)
	String description;

	@Column(name = "start_at", nullable = true)
	Instant startAt;

	@Column(name = "end_at", nullable = true)
	Instant endAt;

	@Column(name = "registration_end_at", nullable = true)
	Instant registrationEndAt;

	@Column(name = "location", nullable = true)
	String location;

	@Column(name = "point", nullable = true)
	Short point;

	@Column(name = "is_mandatory", nullable = false)
	Boolean isMandatory;

	@PrePersist
	public void prePersist() {
		if (isMandatory == null) {
			isMandatory = false;
		}
	}

	@Column(name = "created_at", nullable = false, insertable = false, updatable = false)
	Instant createdAt;
}