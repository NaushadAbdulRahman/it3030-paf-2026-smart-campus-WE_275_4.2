package com.paf.backend.util;

import com.paf.backend.dto.response.*;
import com.paf.backend.model.Ticket;
import com.paf.backend.model.TicketAttachment;
import com.paf.backend.model.TicketComment;
import com.paf.backend.model.TicketStatusHistory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class TicketMapper {

    public TicketResponse toDetailResponse(Ticket ticket, String currentUser) {
        return TicketResponse.builder()
                .id(ticket.getId())
                .title(ticket.getTitle())
                .category(ticket.getCategory())
                .description(ticket.getDescription())
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .resourceId(ticket.getResourceId())
                .location(ticket.getLocation())
                .preferredContact(ticket.getPreferredContact())
                .rejectionReason(ticket.getRejectionReason())
                .resolutionNote(ticket.getResolutionNote())
                .createdBy(ticket.getCreatedBy())
                .assignedTo(ticket.getAssignedTo())
                .slaDeadline(ticket.getSlaDeadline())

                // ✅ FIXED METHOD NAME
                .isSlaBreached(ticket.isSlaBreached())

                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())

                // ✅ ATTACHMENTS (correct type)
                .attachments((ticket.getAttachments() == null ? List.<TicketAttachment>of() : ticket.getAttachments())
                        .stream()
                        .map(this::toAttachmentResponse)
                        .collect(Collectors.toList()))

                // ✅ COMMENTS (correct type)
                .comments((ticket.getComments() == null ? List.<TicketComment>of() : ticket.getComments())
                        .stream()
                        .map(c -> toCommentResponse(c, currentUser))
                        .collect(Collectors.toList()))

                // ✅ STATUS HISTORY (correct type)
                .statusHistory((ticket.getStatusHistory() == null ? List.<TicketStatusHistory>of() : ticket.getStatusHistory())
                        .stream()
                        .map(this::toHistoryResponse)
                        .collect(Collectors.toList()))

                // ✅ COUNTS (FIXED PROPERLY)
                .attachmentCount(ticket.getAttachments() == null ? 0 : ticket.getAttachments().size())
                .commentCount(ticket.getComments() == null ? 0 : ticket.getComments().size())

                .build();
    }

    public TicketResponse toSummaryResponse(Ticket ticket) {
        return TicketResponse.builder()
                .id(ticket.getId())
                .title(ticket.getTitle())
                .category(ticket.getCategory())
                .description(ticket.getDescription())
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .resourceId(ticket.getResourceId())
                .location(ticket.getLocation())
                .preferredContact(ticket.getPreferredContact())
                .rejectionReason(ticket.getRejectionReason())
                .createdBy(ticket.getCreatedBy())
                .assignedTo(ticket.getAssignedTo())
                .slaDeadline(ticket.getSlaDeadline())

                // ✅ FIXED HERE ALSO
                .isSlaBreached(ticket.isSlaBreached())

                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
    }

    public AttachmentResponse toAttachmentResponse(TicketAttachment a) {
        return AttachmentResponse.builder()
                .id(a.getId())
                .ticketId(a.getTicket().getId())
                .fileName(a.getFileName())
                .fileType(a.getFileType())
                .fileSize(a.getFileSize())
                .caption(a.getCaption())
                .uploadedBy(a.getUploadedBy())
                .uploadedAt(a.getUploadedAt())
                .downloadUrl("/api/tickets/" + a.getTicket().getId()
                        + "/attachments/" + a.getId() + "/file")
                .build();
    }

    public CommentResponse toCommentResponse(TicketComment c, String currentUser) {
        return CommentResponse.builder()
                .id(c.getId())
                .ticketId(c.getTicket().getId())
                .content(c.getContent())
                .createdBy(c.getCreatedBy())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())

                // ✅ SAFE EQUALITY
                .editable(currentUser != null && currentUser.equals(c.getCreatedBy()))

                .build();
    }

    public StatusHistoryResponse toHistoryResponse(TicketStatusHistory h) {
        return StatusHistoryResponse.builder()
                .id(h.getId())
                .ticketId(h.getTicket().getId())  // ✅ ADD THIS
                .fromStatus(h.getFromStatus())
                .toStatus(h.getToStatus())
                .changedBy(h.getChangedBy())
                .note(h.getNote())
                .changedAt(h.getChangedAt())
                .build();
    }
}