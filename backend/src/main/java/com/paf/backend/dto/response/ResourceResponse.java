package com.paf.backend.dto.response;

import com.paf.backend.enums.ResourceStatus;
import com.paf.backend.enums.ResourceType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
public class ResourceResponse {

    private Long id;
    private String name;
    private ResourceType type;
    private Integer capacity;
    private String location;
    private String description;
    private LocalTime availabilityStart;
    private LocalTime availabilityEnd;
    private ResourceStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
