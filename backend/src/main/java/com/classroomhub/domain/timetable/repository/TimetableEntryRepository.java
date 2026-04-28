package com.classroomhub.domain.timetable.repository;

import com.classroomhub.domain.timetable.entity.TimetableEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface TimetableEntryRepository extends JpaRepository<TimetableEntry, UUID> {

    List<TimetableEntry> findByClassroomIdAndAcademicYearAndSemester(UUID classroomId, String academicYear, int semester);

    List<TimetableEntry> findByTeacherIdAndAcademicYearAndSemester(UUID teacherId, String academicYear, int semester);

    List<TimetableEntry> findByClassroomIdInAndAcademicYearAndSemester(List<UUID> classroomIds, String academicYear, int semester);

    void deleteByClassroomIdAndAcademicYearAndSemester(UUID classroomId, String academicYear, int semester);

    boolean existsByClassroomIdAndDayOfWeekAndPeriodAndAcademicYearAndSemester(
            UUID classroomId, TimetableEntry.DayOfWeek dayOfWeek, int period, String academicYear, int semester);

    boolean existsByTeacherIdAndDayOfWeekAndPeriodAndAcademicYearAndSemester(
            UUID teacherId, TimetableEntry.DayOfWeek dayOfWeek, int period, String academicYear, int semester);

    @Query("SELECT DISTINCT e.classroomId FROM TimetableEntry e WHERE e.academicYear = :academicYear AND e.semester = :semester")
    List<UUID> findDistinctClassroomIdsByAcademicYearAndSemester(
            @Param("academicYear") String academicYear, @Param("semester") int semester);

    /** All entries for a classroom on a given day, across any academic year/semester. */
    List<TimetableEntry> findByClassroomIdAndDayOfWeek(UUID classroomId, TimetableEntry.DayOfWeek dayOfWeek);

    @Query("SELECT DISTINCT e.classroomId FROM TimetableEntry e")
    List<UUID> findAllDistinctClassroomIds();
}
