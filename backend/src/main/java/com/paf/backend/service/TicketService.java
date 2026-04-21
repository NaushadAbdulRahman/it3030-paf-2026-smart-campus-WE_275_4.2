package com.paf.backend.service;

import com.paf.backend.dto.request.AssignRequest;
import com.paf.backend.dto.request.StatusUpdateRequest;
import com.paf.backend.dto.request.TicketRequest;
import com.paf.backend.dto.response.*;
import com.paf.backend.enums.ActivityType;
import com.paf.backend.enums.TicketStatus;
import com.paf.backend.exception.CustomAccessDeniedException;
import com.paf.backend.exception.InvalidStatusTransitionException;
import com.paf.backend.exception.ResourceNotFoundException;
import com.paf.backend.model.Ticket;
import com.paf.backend.model.TicketAttachment;
import com.paf.backend.model.TicketComment;
import com.paf.backend.model.TicketStatusHistory;
import com.paf.backend.repository.TicketRepository;
import com.paf.backend.repository.TicketStatusHistoryRepository;
import com.paf.backend.util.SlaUtil;
import com.paf.backend.util.TicketMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketStatusHistoryRepository statusHistoryRepository;
    private final SlaUtil slaUtil;
    private final TicketMapper ticketMapper;

    // ─── CREATE ─────────────────────────────────────────────

    public TicketResponse createTicket(TicketRequest request, String createdBy) {
        Ticket ticket = Ticket.builder()
                .title(request.getTitle())
                .category(request.getCategory())
                .description(request.getDescription())
                .priority(request.getPriority())
                .status(TicketStatus.OPEN)
                .resourceId(request.getResourceId())
                .location(request.getLocation())
                .preferredContact(request.getPreferredContact())
                .createdBy(createdBy)
                .slaDeadline(slaUtil.calculateDeadline(request.getPriority()))
                .isSlaBreached(false)
                .build();

        Ticket saved = ticketRepository.save(ticket);

        saveHistory(saved, null, TicketStatus.OPEN, createdBy, "Ticket created");

        return ticketMapper.toSummaryResponse(saved);
    }

    // ─── READ ───────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PagedResponse<TicketResponse> getAllTickets(int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sortBy));
        return buildPagedResponse(ticketRepository.findAll(pageable));
    }

    @Transactional(readOnly = true)
    public PagedResponse<TicketResponse> getMyTickets(String username, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return buildPagedResponse(ticketRepository.findByCreatedBy(username, pageable));
    }

    @Transactional(readOnly = true)
    public TicketResponse getTicketById(Long id, String currentUser) {
        return ticketMapper.toDetailResponse(findTicketOrThrow(id), currentUser);
    }

    @Transactional(readOnly = true)
    public List<TicketResponse> getOverdueTickets() {
        return ticketRepository
                .findByIsSlaBreachedTrueAndStatusNotIn(
                        List.of(TicketStatus.RESOLVED, TicketStatus.CLOSED, TicketStatus.REJECTED))
                .stream()
                .map(ticketMapper::toSummaryResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TicketResponse> checkDuplicates(String resourceId) {
        return ticketRepository
                .findByResourceIdAndStatusIn(resourceId,
                        List.of(TicketStatus.OPEN, TicketStatus.IN_PROGRESS))
                .stream()
                .map(ticketMapper::toSummaryResponse)
                .collect(Collectors.toList());
    }

    // ─── UPDATE ─────────────────────────────────────────────

    public TicketResponse updateTicket(Long id, TicketRequest request, String currentUser) {
        Ticket ticket = findTicketOrThrow(id);

        if (currentUser == null || !currentUser.equals(ticket.getCreatedBy())) {
            throw new CustomAccessDeniedException("You can only edit your own tickets");
        }

        if (ticket.getStatus() == TicketStatus.CLOSED
                || ticket.getStatus() == TicketStatus.RESOLVED
                || ticket.getStatus() == TicketStatus.REJECTED) {
            throw new InvalidStatusTransitionException(
                    "Cannot edit ticket with status: " + ticket.getStatus());
        }

        ticket.setTitle(request.getTitle());
        ticket.setCategory(request.getCategory());
        ticket.setDescription(request.getDescription());
        ticket.setLocation(request.getLocation());
        ticket.setPreferredContact(request.getPreferredContact());

        if (!ticket.getPriority().equals(request.getPriority())) {
            ticket.setPriority(request.getPriority());
            ticket.setSlaDeadline(slaUtil.calculateDeadline(request.getPriority()));
            ticket.setIsSlaBreached(slaUtil.isBreached(ticket.getSlaDeadline()));
        }

        return ticketMapper.toSummaryResponse(ticketRepository.save(ticket));
    }

    public TicketResponse updateStatus(Long id, StatusUpdateRequest request, String currentUser) {
        Ticket ticket = findTicketOrThrow(id);

        TicketStatus newStatus = request.getStatus();
        TicketStatus oldStatus = ticket.getStatus();

        validateStatusTransition(oldStatus, newStatus);

        if (newStatus == TicketStatus.REJECTED &&
                (request.getNote() == null || request.getNote().isBlank())) {
            throw new InvalidStatusTransitionException("Rejection requires a reason");
        }

        if (newStatus == TicketStatus.REJECTED) {
            ticket.setRejectionReason(request.getNote());
        }

        if (newStatus == TicketStatus.RESOLVED && request.getNote() != null) {
            ticket.setResolutionNote(request.getNote());
        }

        ticket.setStatus(newStatus);
        saveHistory(ticket, oldStatus, newStatus, currentUser, request.getNote());

        return ticketMapper.toSummaryResponse(ticketRepository.save(ticket));
    }

    public TicketResponse assignTechnician(Long id, AssignRequest request, String currentUser) {
        Ticket ticket = findTicketOrThrow(id);

        ticket.setAssignedTo(request.getTechnicianId());

        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
            saveHistory(ticket, TicketStatus.OPEN, TicketStatus.IN_PROGRESS,
                    currentUser, "Assigned to " + request.getTechnicianId());
        } else {
            saveHistory(ticket, ticket.getStatus(), ticket.getStatus(),
                    currentUser, "Reassigned to " + request.getTechnicianId());
        }

        return ticketMapper.toSummaryResponse(ticketRepository.save(ticket));
    }

    // ─── DELETE ─────────────────────────────────────────────

    public void deleteTicket(Long id, String currentUser) {
        Ticket ticket = findTicketOrThrow(id);

        if (currentUser == null || !currentUser.equals(ticket.getCreatedBy())) {
            throw new CustomAccessDeniedException("You can only delete your own tickets");
        }

        ticketRepository.delete(ticket);
    }

    // ─── ACTIVITY FEED ──────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ActivityResponse> getActivityFeed(Long ticketId) {
        Ticket ticket = findTicketOrThrow(ticketId);
        List<ActivityResponse> activities = new ArrayList<>();

        activities.add(ActivityResponse.builder()
                .type(ActivityType.CREATED)
                .description("Ticket created")
                .actor(ticket.getCreatedBy())
                .timestamp(ticket.getCreatedAt())
                .detail("Priority: " + ticket.getPriority())
                .build());

        (ticket.getStatusHistory() == null ? List.<TicketStatusHistory>of() : ticket.getStatusHistory())
                .forEach(h -> {
                    if (h.getFromStatus() != null) {
                        activities.add(ActivityResponse.builder()
                                .type(ActivityType.STATUS_CHANGE)
                                .description("Status changed from " + h.getFromStatus()
                                        + " to " + h.getToStatus())
                                .actor(h.getChangedBy())
                                .timestamp(h.getChangedAt())
                                .detail(h.getNote())
                                .build());
                    }
                });

        (ticket.getComments() == null ? List.<TicketComment>of() : ticket.getComments())
                .forEach(c -> activities.add(ActivityResponse.builder()
                        .type(ActivityType.COMMENT)
                        .description("Comment added")
                        .actor(c.getCreatedBy())
                        .timestamp(c.getCreatedAt())
                        .detail(c.getContent())
                        .build()));

        (ticket.getAttachments() == null ? List.<TicketAttachment>of() : ticket.getAttachments())
                .forEach(a -> activities.add(ActivityResponse.builder()
                        .type(ActivityType.ATTACHMENT)
                        .description("Attachment uploaded")
                        .actor(a.getUploadedBy())
                        .timestamp(a.getUploadedAt())
                        .detail(a.getFileName())
                        .build()));

        activities.sort((a, b) -> a.getTimestamp().compareTo(b.getTimestamp()));

        return activities;
    }

    // ─── SLA SCHEDULER ──────────────────────────────────────

    @Scheduled(fixedDelay = 900000)
    public void checkSlaBreaches() {
        List<TicketStatus> terminal =
                List.of(TicketStatus.RESOLVED, TicketStatus.CLOSED, TicketStatus.REJECTED);

        ticketRepository
                .findBySlaDeadlineBeforeAndIsSlaBreachedFalseAndStatusNotIn(
                        LocalDateTime.now(), terminal)
                .forEach(ticket -> {
                    ticket.setIsSlaBreached(true);
                    ticketRepository.save(ticket);
                });
    }

    // ─── HELPERS ────────────────────────────────────────────

    private Ticket findTicketOrThrow(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Ticket not found with id: " + id));
    }

    private void saveHistory(Ticket ticket, TicketStatus from, TicketStatus to,
                             String changedBy, String note) {
        statusHistoryRepository.save(TicketStatusHistory.builder()
                .ticket(ticket)
                .fromStatus(from)
                .toStatus(to)
                .changedBy(changedBy)
                .note(note)
                .build());
    }

    private void validateStatusTransition(TicketStatus current, TicketStatus next) {
        boolean valid = switch (current) {
            case OPEN -> next == TicketStatus.IN_PROGRESS || next == TicketStatus.REJECTED;
            case IN_PROGRESS -> next == TicketStatus.RESOLVED || next == TicketStatus.REJECTED;
            case RESOLVED -> next == TicketStatus.CLOSED;
            case CLOSED, REJECTED -> false;
        };

        if (!valid) {
            throw new InvalidStatusTransitionException(
                    "Cannot transition from " + current + " to " + next);
        }
    }

    private PagedResponse<TicketResponse> buildPagedResponse(Page<Ticket> page) {
        return PagedResponse.<TicketResponse>builder()
                .content(page.getContent().stream()
                        .map(ticketMapper::toSummaryResponse)
                        .collect(Collectors.toList()))
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}