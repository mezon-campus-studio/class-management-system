package com.classroomhub.domain.fund.repository;

import com.classroomhub.domain.fund.entity.FundPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FundPaymentRepository extends JpaRepository<FundPayment, UUID> {
    List<FundPayment> findByCollectionId(UUID collectionId);
    List<FundPayment> findByClassroomIdAndMemberId(UUID classroomId, UUID memberId);
    Optional<FundPayment> findByIdAndClassroomId(UUID id, UUID classroomId);
}
