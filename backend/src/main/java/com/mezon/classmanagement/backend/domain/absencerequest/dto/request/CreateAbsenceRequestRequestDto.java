package com.mezon.classmanagement.backend.domain.absencerequest.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.mezon.classmanagement.backend.common.annotation.DTO;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;


@FieldDefaults(level = AccessLevel.PRIVATE)
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@DTO
public final class CreateAbsenceRequestRequestDto {
    @JsonProperty("class_id")
    Long classId;

    @JsonProperty("reason")
    String reason;

    @FutureOrPresent
    @JsonProperty("from")
    Instant from;

    @Future
    @JsonProperty("to")
    Instant to;

    @JsonProperty("proof_url")
    String proofUrl;
}
