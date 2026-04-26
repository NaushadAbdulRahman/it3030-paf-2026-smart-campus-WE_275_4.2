package com.paf.backend.dto.response;

import com.paf.backend.enums.ActivityType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ActivityResponse {

    private ActivityType type;

    private String description;
    private String actor;

    private LocalDateTime timestamp;

    private String detail;
}