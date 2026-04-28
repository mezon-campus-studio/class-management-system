package com.classroomhub.domain.fund.repository;

import com.classroomhub.domain.fund.entity.FundExpense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FundExpenseRepository extends JpaRepository<FundExpense, UUID> {
    List<FundExpense> findByClassroomId(UUID classroomId);
    Optional<FundExpense> findByIdAndClassroomId(UUID id, UUID classroomId);
}
