package com.mezon.classmanagement.backend.domain.absencerequest.dto.response;

import com.fasterxml.jackson.annotation.*;
import com.mezon.classmanagement.backend.common.annotation.DTO;
import com.mezon.classmanagement.backend.common.constant.DateTimeConstant;
import com.mezon.classmanagement.backend.domain.absencerequest.entity.AbsenceRequest;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@JsonPropertyOrder({
        "id",
        "class_id",
        "user_id",
        "reason",
        "from",
        "to",
        "proof_url",
        "status",
        "created_at"
})
@JsonInclude(JsonInclude.Include.NON_NULL)
@FieldDefaults(level = AccessLevel.PRIVATE)
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@DTO
public final class AbsenceRequestResponseDto {

    @JsonProperty("id")
    Long id;

    @JsonProperty("class_id")
    Long classId;

    @JsonProperty("user_id")
    Long userId;

    @JsonProperty("reason")
    String reason;

    @JsonProperty("from")
    Instant from;

    @JsonProperty("to")
    Instant to;

    @JsonProperty("proof_url")
    String proofUrl;

    @JsonProperty("status")
    AbsenceRequest.Status status;

    @JsonFormat(pattern = DateTimeConstant.PATTERN, timezone = DateTimeConstant.TIMEZONE)
    @JsonProperty("created_at")
    Instant createdAt;

}
