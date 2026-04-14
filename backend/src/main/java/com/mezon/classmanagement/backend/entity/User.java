package com.mezon.classmanagement.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.jspecify.annotations.NullMarked;
import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Instant;
import java.util.Collection;
import java.util.List;

@Entity
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(
		name = "users",
		indexes = {
				@Index(name = "index_users_username", columnList = "username"),
				@Index(name = "index_users_phone", columnList = "phone"),
				@Index(name = "index_users_email", columnList = "email")

		}
)
public class User implements UserDetails {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false)
	Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    Type type;

    @Column(name = "username", nullable = false, unique = true)
    String username;

    @Column(name = "hashed_password", nullable = true)
    String hashedPassword;

    @Column(name = "display_name", nullable = true)
    String displayName;

    @Column(name = "avatar_url", nullable = true)
    String avatarUrl;

	@Column(name = "phone", nullable = true, unique = true)
	String phone;

	@Column(name = "email", nullable = true, unique = true)
	String email;

	@Column(name = "joined_at", nullable = false, insertable = false, updatable = false)
	Instant joinedAt;

	public enum Type {
		GOOGLE,
		MEZON,
		INTERNAL
	}

	@NullMarked
	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return List.of();
	}

	@Override
	public @Nullable String getPassword() {
		return this.hashedPassword;
	}

	@Override
	public boolean isAccountNonExpired() {
		return UserDetails.super.isAccountNonExpired();
	}

	@Override
	public boolean isAccountNonLocked() {
		return UserDetails.super.isAccountNonLocked();
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return UserDetails.super.isCredentialsNonExpired();
	}

	@Override
	public boolean isEnabled() {
		return UserDetails.super.isEnabled();
	}

}