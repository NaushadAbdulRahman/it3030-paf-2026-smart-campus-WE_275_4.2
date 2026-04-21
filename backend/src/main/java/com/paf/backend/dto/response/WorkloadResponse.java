package com.paf.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WorkloadResponse {

    private String technicianId;

    private long openCount;
    private long inProgressCount;
    private long resolvedCount;

    private long totalActive;

    // "LOW" | "MODERATE" | "HIGH"
    private String workloadLevel;
}