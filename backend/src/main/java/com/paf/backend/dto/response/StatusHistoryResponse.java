package com.paf.backend.dto.response;

import com.paf.backend.enums.TicketStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class StatusHistoryResponse {

    private Long id;
    private long ticketId;

    private TicketStatus fromStatus;
    private TicketStatus toStatus;

    private String changedBy;
    private String note;

    private LocalDateTime changedAt;
}