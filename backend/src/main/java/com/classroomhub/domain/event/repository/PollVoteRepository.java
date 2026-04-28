package com.classroomhub.domain.event.repository;

import com.classroomhub.domain.event.entity.PollVote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PollVoteRepository extends JpaRepository<PollVote, UUID> {
    List<PollVote> findByPollId(UUID pollId);
    boolean existsByPollIdAndUserId(UUID pollId, UUID userId);
    List<PollVote> findByPollIdAndUserId(UUID pollId, UUID userId);
    boolean existsByPollIdAndOptionIdAndUserId(UUID pollId, UUID optionId, UUID userId);
    void deleteByPollIdAndUserId(UUID pollId, UUID userId);
}
