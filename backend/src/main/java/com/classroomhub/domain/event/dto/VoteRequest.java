package com.classroomhub.domain.event.dto;

import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

/**
 * Replace-semantics: clients send the full desired option-ID set. An empty
 * list is valid and means "clear my vote".
 */
public record VoteRequest(
        @NotNull List<UUID> optionIds
) {}
