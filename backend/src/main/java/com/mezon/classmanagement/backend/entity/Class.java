package com.mezon.classmanagement.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
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
@Table(
		name = "classes",
		indexes = {
				@Index(name = "index_classes_code", columnList = "code")
		}
)
public class Class {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false)
	Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "owner_user_id", nullable = false)
	User owner;

	@Column(name = "name", nullable = true)
	String name;

	@Column(name = "description", nullable = true)
	String description;

	@Column(name = "code", nullable = false)
	String code;

	@Column(name = "avatar_url", nullable = true)
	String avatarUrl;

	@Enumerated(EnumType.STRING)
	@Column(name = "privacy", nullable = false)
	Privacy privacy;

	@PrePersist
	public void prePersist() {
		if (privacy == null) {
			privacy = Privacy.PRIVATE;
		}
	}

	@Column(name = "created_at", nullable = false, insertable = false, updatable = false)
	Instant createdAt;

	public enum Privacy {
		PUBLIC,
		PRIVATE
	}
}