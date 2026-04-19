package com.mezon.classmanagement.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.Immutable;

@Entity
@Immutable
@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@NoArgsConstructor
@Table(name = "permissions")
public class Permission {
	@Id
	Long id;

	@Column(name = "code", nullable = false, unique = true)
	String code;

	@Column(name = "name", nullable = false)
	String name;
}