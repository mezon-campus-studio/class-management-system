package com.classroomhub.domain.auth.repository;

import com.classroomhub.domain.auth.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByUserType(User.UserType userType);
    Optional<User> findFirstByUserType(User.UserType userType);
    Optional<User> findByStudentCode(String studentCode);
    long countByUserType(User.UserType userType);

    @Query("SELECT u FROM User u WHERE " +
            "(:userType IS NULL OR u.userType = :userType) AND " +
            "(LOWER(u.email) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
            " LOWER(u.displayName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
            " (u.studentCode IS NOT NULL AND LOWER(u.studentCode) LIKE LOWER(CONCAT('%', :q, '%'))))")
    List<User> searchUsers(@Param("q") String q, @Param("userType") User.UserType userType);

    @Query("SELECT u FROM User u WHERE " +
            "(:userType IS NULL OR u.userType = :userType) AND " +
            "(LOWER(u.email) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
            " LOWER(u.displayName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
            " (u.studentCode IS NOT NULL AND LOWER(u.studentCode) LIKE LOWER(CONCAT('%', :q, '%'))))")
    Page<User> searchUsersPage(@Param("q") String q, @Param("userType") User.UserType userType, Pageable pageable);
}
