package com.paf.backend.dto.request;

import com.paf.backend.enums.TicketStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class StatusUpdateRequest {

    @NotNull(message = "Status is required")
    private TicketStatus status;

    @Size(max = 1000, message = "Note cannot exceed 1000 characters")
    private String note;
}