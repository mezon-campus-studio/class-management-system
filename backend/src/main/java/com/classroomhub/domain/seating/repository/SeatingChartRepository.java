package com.classroomhub.domain.seating.repository;

import com.classroomhub.domain.seating.entity.SeatingChart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SeatingChartRepository extends JpaRepository<SeatingChart, UUID> {}
