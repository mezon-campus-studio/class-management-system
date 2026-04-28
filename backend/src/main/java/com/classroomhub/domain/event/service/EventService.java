package com.classroomhub.domain.event.service;

import com.classroomhub.common.exception.BusinessException;
import com.classroomhub.common.exception.ErrorCode;
import com.classroomhub.domain.classroom.entity.ClassroomMember;
import com.classroomhub.domain.classroom.service.ClassroomService;
import com.classroomhub.domain.event.dto.*;
import com.classroomhub.domain.event.entity.*;
import com.classroomhub.domain.event.repository.*;
import com.classroomhub.domain.notification.entity.Notification;
import com.classroomhub.domain.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EventService {

    private final EventRepository eventRepository;
    private final EventRsvpRepository eventRsvpRepository;
    private final AbsenceRequestRepository absenceRequestRepository;
    private final PollRepository pollRepository;
    private final PollOptionRepository pollOptionRepository;
    private final PollVoteRepository pollVoteRepository;
    private final ClassroomService classroomService;
    private final NotificationService notificationService;

    public EventResponse createEvent(UUID classroomId, CreateEventRequest req, UUID userId) {
        // Mọi thành viên trong lớp có thể tạo sự kiện.
        classroomService.requireMember(classroomId, userId);
        if (req.endTime() != null && req.endTime().isBefore(req.startTime())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        }
        Event event = Event.builder()
                .classroomId(classroomId)
                .title(req.title())
                .description(req.description())
                .startTime(req.startTime())
                .endTime(req.endTime())
                .location(req.location())
                .mandatory(req.mandatory())
                .createdById(userId)
                .build();
        eventRepository.save(event);
        notificationService.sendToClassroomMembers(
                classroomId, userId,
                Notification.Type.EVENT_CREATED,
                "Sự kiện mới: " + req.title(),
                req.description() != null
                        ? req.description().substring(0, Math.min(100, req.description().length()))
                        : null,
                event.getId()
        );
        return toEventResponse(event);
    }

    @Transactional(readOnly = true)
    public Page<EventResponse> listEvents(UUID classroomId, UUID userId, int page, int size) {
        classroomService.requireMember(classroomId, userId);
        return eventRepository.findByClassroomIdOrderByStartTimeDesc(
                classroomId, PageRequest.of(page, size))
                .map(this::toEventResponse);
    }

    @Transactional(readOnly = true)
    public EventResponse getEvent(UUID classroomId, UUID eventId, UUID userId) {
        classroomService.requireMember(classroomId, userId);
        Event event = eventRepository.findByIdAndClassroomId(eventId, classroomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.EVENT_NOT_FOUND));
        return toEventResponse(event);
    }

    public EventResponse updateEvent(UUID classroomId, UUID eventId, UpdateEventRequest req, UUID userId) {
        Event event = eventRepository.findByIdAndClassroomId(eventId, classroomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.EVENT_NOT_FOUND));
        // Author can edit; otherwise must be teacher+.
        if (!event.getCreatedById().equals(userId)) {
            classroomService.requireRoleAtLeast(classroomId, userId, ClassroomMember.Role.TEACHER);
        } else {
            classroomService.requireMember(classroomId, userId);
        }
        if (req.title() != null && !req.title().isBlank()) event.setTitle(req.title());
        if (req.description() != null) event.setDescription(req.description().isEmpty() ? null : req.description());
        if (req.startTime() != null) event.setStartTime(req.startTime());
        if (req.endTime() != null) event.setEndTime(req.endTime());
        if (req.location() != null) event.setLocation(req.location().isEmpty() ? null : req.location());
        if (req.mandatory() != null) event.setMandatory(req.mandatory());
        if (event.getEndTime() != null && event.getEndTime().isBefore(event.getStartTime())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        }
        eventRepository.save(event);
        return toEventResponse(event);
    }

    public void deleteEvent(UUID classroomId, UUID eventId, UUID userId) {
        Event event = eventRepository.findByIdAndClassroomId(eventId, classroomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.EVENT_NOT_FOUND));
        if (!event.getCreatedById().equals(userId)) {
            classroomService.requireRoleAtLeast(classroomId, userId, ClassroomMember.Role.TEACHER);
        } else {
            classroomService.requireMember(classroomId, userId);
        }
        // RSVPs and absence requests cascade by FK on the schema side.
        eventRsvpRepository.deleteAll(eventRsvpRepository.findByEventId(eventId));
        eventRepository.delete(event);
    }

    public RsvpResponse rsvp(UUID classroomId, UUID eventId, RsvpRequest req, UUID userId) {
        classroomService.requireMember(classroomId, userId);
        EventRsvp rsvp = eventRsvpRepository.findByEventIdAndUserId(eventId, userId)
                .map(existing -> {
                    existing.setResponse(req.response());
                    existing.setNote(req.note());
                    return existing;
                })
                .orElseGet(() -> EventRsvp.builder()
                        .eventId(eventId)
                        .userId(userId)
                        .response(req.response())
                        .note(req.note())
                        .build());
        eventRsvpRepository.save(rsvp);
        return toRsvpResponse(rsvp);
    }

    @Transactional(readOnly = true)
    public List<RsvpResponse> listRsvps(UUID classroomId, UUID eventId, UUID userId) {
        classroomService.requireMember(classroomId, userId);
        return eventRsvpRepository.findByEventId(eventId).stream()
                .map(this::toRsvpResponse)
                .toList();
    }

    public AbsenceRequestResponse createAbsenceRequest(UUID classroomId, CreateAbsenceRequest req, UUID userId) {
        classroomService.requireMember(classroomId, userId);
        AbsenceRequest absenceRequest = AbsenceRequest.builder()
                .classroomId(classroomId)
                .userId(userId)
                .eventId(req.eventId())
                .reason(req.reason())
                .status(AbsenceRequest.Status.PENDING)
                .build();
        absenceRequestRepository.save(absenceRequest);
        return toAbsenceRequestResponse(absenceRequest);
    }

    @Transactional(readOnly = true)
    public List<AbsenceRequestResponse> listAbsenceRequests(UUID classroomId, UUID userId) {
        ClassroomMember member = classroomService.requireMember(classroomId, userId);
        List<ClassroomMember.Role> roleOrder = List.of(
                ClassroomMember.Role.MEMBER,
                ClassroomMember.Role.GROUP_LEADER,
                ClassroomMember.Role.TREASURER,
                ClassroomMember.Role.VICE_MONITOR,
                ClassroomMember.Role.MONITOR,
                ClassroomMember.Role.TEACHER,
                ClassroomMember.Role.OWNER
        );
        boolean isMonitorOrAbove = roleOrder.indexOf(member.getRole()) >= roleOrder.indexOf(ClassroomMember.Role.MONITOR);
        List<AbsenceRequest> requests = isMonitorOrAbove
                ? absenceRequestRepository.findByClassroomId(classroomId)
                : absenceRequestRepository.findByClassroomIdAndUserId(classroomId, userId);
        return requests.stream().map(this::toAbsenceRequestResponse).toList();
    }

    /**
     * Author can cancel their own absence request as long as it is still PENDING;
     * monitor+ can cancel any state.
     */
    public void cancelAbsenceRequest(UUID classroomId, UUID requestId, UUID userId) {
        AbsenceRequest absenceRequest = absenceRequestRepository.findById(requestId)
                .filter(r -> r.getClassroomId().equals(classroomId))
                .orElseThrow(() -> new BusinessException(ErrorCode.ABSENCE_REQUEST_NOT_FOUND));
        boolean isAuthor = absenceRequest.getUserId().equals(userId);
        if (!isAuthor) {
            classroomService.requireRoleAtLeast(classroomId, userId, ClassroomMember.Role.MONITOR);
        } else {
            classroomService.requireMember(classroomId, userId);
            if (absenceRequest.getStatus() != AbsenceRequest.Status.PENDING) {
                throw new BusinessException(ErrorCode.ABSENCE_REQUEST_NOT_PENDING);
            }
        }
        absenceRequestRepository.delete(absenceRequest);
    }

    public AbsenceRequestResponse reviewAbsenceRequest(UUID classroomId, UUID requestId, ReviewAbsenceRequest req, UUID userId) {
        classroomService.requireRoleAtLeast(classroomId, userId, ClassroomMember.Role.MONITOR);
        AbsenceRequest absenceRequest = absenceRequestRepository.findById(requestId)
                .filter(r -> r.getClassroomId().equals(classroomId))
                .orElseThrow(() -> new BusinessException(ErrorCode.ABSENCE_REQUEST_NOT_FOUND));
        if (absenceRequest.getStatus() != AbsenceRequest.Status.PENDING) {
            throw new BusinessException(ErrorCode.ABSENCE_REQUEST_NOT_PENDING);
        }
        absenceRequest.setStatus(req.status());
        absenceRequest.setReviewedById(userId);
        absenceRequest.setReviewNote(req.reviewNote());
        absenceRequest.setReviewedAt(Instant.now());
        absenceRequestRepository.save(absenceRequest);
        return toAbsenceRequestResponse(absenceRequest);
    }

    public PollResponse createPoll(UUID classroomId, CreatePollRequest req, UUID userId) {
        // Mọi thành viên trong lớp có thể tạo bình chọn.
        classroomService.requireMember(classroomId, userId);
        Poll poll = Poll.builder()
                .classroomId(classroomId)
                .question(req.question())
                .multiChoice(req.multiChoice())
                .anonymous(req.anonymous())
                .closesAt(req.closesAt())
                .createdById(userId)
                .build();
        pollRepository.save(poll);
        List<PollOption> options = new java.util.ArrayList<>();
        List<String> optionTexts = req.options();
        for (int i = 0; i < optionTexts.size(); i++) {
            PollOption option = PollOption.builder()
                    .pollId(poll.getId())
                    .text(optionTexts.get(i))
                    .sortOrder(i)
                    .build();
            pollOptionRepository.save(option);
            options.add(option);
        }
        return toPollResponse(poll, options, List.of(), userId);
    }

    public PollResponse updatePoll(UUID classroomId, UUID pollId, UpdatePollRequest req, UUID userId) {
        Poll poll = pollRepository.findByIdAndClassroomId(pollId, classroomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POLL_NOT_FOUND));
        if (!poll.getCreatedById().equals(userId)) {
            classroomService.requireRoleAtLeast(classroomId, userId, ClassroomMember.Role.TEACHER);
        } else {
            classroomService.requireMember(classroomId, userId);
        }
        if (req.question() != null && !req.question().isBlank()) poll.setQuestion(req.question());
        if (Boolean.TRUE.equals(req.closeNow())) {
            poll.setClosesAt(Instant.now());
        } else if (req.closesAt() != null) {
            poll.setClosesAt(req.closesAt());
        }
        pollRepository.save(poll);
        List<PollOption> options = pollOptionRepository.findByPollId(pollId);
        List<PollVote> votes = pollVoteRepository.findByPollId(pollId);
        return toPollResponse(poll, options, votes, userId);
    }

    public void deletePoll(UUID classroomId, UUID pollId, UUID userId) {
        Poll poll = pollRepository.findByIdAndClassroomId(pollId, classroomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POLL_NOT_FOUND));
        if (!poll.getCreatedById().equals(userId)) {
            classroomService.requireRoleAtLeast(classroomId, userId, ClassroomMember.Role.TEACHER);
        } else {
            classroomService.requireMember(classroomId, userId);
        }
        // Cascade by FK; explicitly clear votes + options to be safe across DBs.
        pollVoteRepository.deleteAll(pollVoteRepository.findByPollId(pollId));
        pollOptionRepository.deleteAll(pollOptionRepository.findByPollId(pollId));
        pollRepository.delete(poll);
    }

    @Transactional(readOnly = true)
    public List<PollResponse> listPolls(UUID classroomId, UUID userId) {
        classroomService.requireMember(classroomId, userId);
        return pollRepository.findByClassroomId(classroomId).stream()
                .map(poll -> {
                    List<PollOption> options = pollOptionRepository.findByPollId(poll.getId());
                    List<PollVote> votes = pollVoteRepository.findByPollId(poll.getId());
                    return toPollResponse(poll, options, votes, userId);
                })
                .toList();
    }

    /**
     * Replaces the requester's vote set for the poll. The client always sends
     * the desired final set of option IDs (possibly empty to clear). For
     * single-choice polls, the request must contain at most one option ID.
     */
    public PollResponse vote(UUID classroomId, UUID pollId, VoteRequest req, UUID userId) {
        classroomService.requireMember(classroomId, userId);
        Poll poll = pollRepository.findByIdAndClassroomId(pollId, classroomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POLL_NOT_FOUND));
        if (!poll.isOpen()) {
            throw new BusinessException(ErrorCode.POLL_CLOSED);
        }
        List<UUID> requested = req.optionIds() != null ? req.optionIds() : List.of();
        if (!poll.isMultiChoice() && requested.size() > 1) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        }
        // Validate every option belongs to this poll.
        List<PollOption> options = pollOptionRepository.findByPollId(pollId);
        java.util.Set<UUID> validIds = options.stream().map(PollOption::getId).collect(Collectors.toSet());
        for (UUID id : requested) {
            if (!validIds.contains(id)) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR);
            }
        }

        // Replace semantics: wipe existing votes for this user, then re-insert
        // the desired set. Simpler than diffing and avoids the uncheck-not-saved bug.
        pollVoteRepository.deleteByPollIdAndUserId(pollId, userId);
        pollVoteRepository.flush();
        for (UUID optionId : requested) {
            PollVote vote = PollVote.builder()
                    .pollId(pollId)
                    .optionId(optionId)
                    .userId(userId)
                    .build();
            pollVoteRepository.save(vote);
        }
        List<PollVote> votes = pollVoteRepository.findByPollId(pollId);
        return toPollResponse(poll, options, votes, userId);
    }

    @Scheduled(cron = "0 0 20 * * *")
    @Transactional(readOnly = true)
    public void sendEventReminders() {
        ZonedDateTime tomorrowStart = ZonedDateTime.now(ZoneOffset.UTC).plusDays(1)
                .toLocalDate().atStartOfDay(ZoneOffset.UTC);
        Instant from = tomorrowStart.toInstant();
        Instant to = tomorrowStart.plusDays(1).minusNanos(1).toInstant();
        eventRepository.findByStartTimeBetween(from, to).forEach(event ->
                notificationService.sendToClassroomMembers(
                        event.getClassroomId(), null,
                        Notification.Type.EVENT_REMINDER,
                        "Nhắc nhở sự kiện: " + event.getTitle(),
                        "Sự kiện diễn ra vào ngày mai",
                        event.getId()
                )
        );
    }

    private PollResponse toPollResponse(Poll poll, List<PollOption> options, List<PollVote> votes, UUID requesterId) {
        Map<UUID, Long> voteCountByOption = votes.stream()
                .collect(Collectors.groupingBy(PollVote::getOptionId, Collectors.counting()));
        Map<UUID, List<UUID>> votersByOption = votes.stream()
                .collect(Collectors.groupingBy(
                        PollVote::getOptionId,
                        Collectors.mapping(PollVote::getUserId, Collectors.toList())));
        List<UUID> myOptionIds = votes.stream()
                .filter(v -> v.getUserId().equals(requesterId))
                .map(PollVote::getOptionId)
                .toList();
        List<PollOptionResponse> optionResponses = options.stream()
                .map(o -> new PollOptionResponse(
                        o.getId(),
                        o.getText(),
                        voteCountByOption.getOrDefault(o.getId(), 0L),
                        poll.isAnonymous() ? List.of() : votersByOption.getOrDefault(o.getId(), List.of())
                ))
                .toList();
        return new PollResponse(
                poll.getId(),
                poll.getQuestion(),
                poll.isMultiChoice(),
                poll.isAnonymous(),
                poll.getClosesAt(),
                poll.isOpen(),
                optionResponses,
                poll.getCreatedById(),
                myOptionIds
        );
    }

    private EventResponse toEventResponse(Event event) {
        return new EventResponse(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getStartTime(),
                event.getEndTime(),
                event.getLocation(),
                event.isMandatory(),
                event.getCreatedById(),
                event.getCreatedAt()
        );
    }

    private RsvpResponse toRsvpResponse(EventRsvp rsvp) {
        return new RsvpResponse(
                rsvp.getId(),
                rsvp.getEventId(),
                rsvp.getUserId(),
                rsvp.getResponse(),
                rsvp.getNote()
        );
    }

    private AbsenceRequestResponse toAbsenceRequestResponse(AbsenceRequest req) {
        return new AbsenceRequestResponse(
                req.getId(),
                req.getUserId(),
                req.getEventId(),
                req.getReason(),
                req.getStatus(),
                req.getReviewedById(),
                req.getReviewNote(),
                req.getReviewedAt(),
                req.getCreatedAt()
        );
    }
}
