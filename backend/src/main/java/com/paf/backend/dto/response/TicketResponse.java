package com.paf.backend.dto.response;

import com.paf.backend.enums.TicketCategory;
import com.paf.backend.enums.TicketPriority;
import com.paf.backend.enums.TicketStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class TicketResponse {

    private Long id;

    private String title;
    private TicketCategory category;
    private String description;
    private TicketPriority priority;
    private TicketStatus status;

    private String resourceId;
    private String location;
    private String preferredContact;

    private String rejectionReason;
    private String resolutionNote;

    private String createdBy;
    private String assignedTo;

    private LocalDateTime slaDeadline;
    private boolean isSlaBreached;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private List<AttachmentResponse> attachments;
    private List<CommentResponse> comments;
    private List<StatusHistoryResponse> statusHistory;

    private long attachmentCount;
    private long commentCount;
}