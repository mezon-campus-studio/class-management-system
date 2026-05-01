package com.mezon.classmanagement.backend.domain.absencerequest.repository;

import com.mezon.classmanagement.backend.domain.absencerequest.entity.AbsenceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AbsenceRequestRepository extends JpaRepository<AbsenceRequest, Long> {
    List<AbsenceRequest> findByUser_Id(Long userId);
    List<AbsenceRequest> findByClazz_Id(Long classId);

}