package com.paf.backend.controller;

import com.paf.backend.dto.request.AssignRequest;
import com.paf.backend.dto.request.StatusUpdateRequest;
import com.paf.backend.dto.request.TicketRequest;
import com.paf.backend.dto.response.*;
import com.paf.backend.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class TicketController {

    private final TicketService ticketService;

    // ─── CREATE ─────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<ApiResponse<TicketResponse>> createTicket(
            @Valid @RequestBody TicketRequest request,
            @RequestHeader(value = "X-User-Email", defaultValue = "user@campus.lk") String userEmail) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Ticket created successfully",
                        ticketService.createTicket(request, userEmail)));
    }

    // ─── GET ALL ────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<TicketResponse>>> getTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "false") boolean myTickets,
            @RequestHeader(value = "X-User-Email", defaultValue = "user@campus.lk") String userEmail) {

        PagedResponse<TicketResponse> tickets = myTickets
                ? ticketService.getMyTickets(userEmail, page, size)
                : ticketService.getAllTickets(page, size, sortBy);

        return ResponseEntity.ok(ApiResponse.success(tickets));
    }

    // ─── OVERDUE ────────────────────────────────────────────

    @GetMapping("/overdue")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getOverdueTickets() {
        return ResponseEntity.ok(
                ApiResponse.success("Overdue tickets",
                        ticketService.getOverdueTickets()));
    }

    // ─── DUPLICATE CHECK ────────────────────────────────────

    @GetMapping("/duplicate-check")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> checkDuplicates(
            @RequestParam String resourceId) {

        return ResponseEntity.ok(
                ApiResponse.success("Duplicate check results",
                        ticketService.checkDuplicates(resourceId)));
    }

    // ─── GET ONE ────────────────────────────────────────────

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketResponse>> getTicket(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Email", defaultValue = "user@campus.lk") String userEmail) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        ticketService.getTicketById(id, userEmail)));
    }

    // ─── UPDATE ─────────────────────────────────────────────

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketResponse>> updateTicket(
            @PathVariable Long id,
            @Valid @RequestBody TicketRequest request,
            @RequestHeader(value = "X-User-Email", defaultValue = "user@campus.lk") String userEmail) {

        return ResponseEntity.ok(
                ApiResponse.success("Ticket updated",
                        ticketService.updateTicket(id, request, userEmail)));
    }

    // ─── UPDATE STATUS ──────────────────────────────────────

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TicketResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request,
            @RequestHeader(value = "X-User-Email", defaultValue = "user@campus.lk") String userEmail) {

        return ResponseEntity.ok(
                ApiResponse.success("Status updated",
                        ticketService.updateStatus(id, request, userEmail)));
    }

    // ─── ASSIGN ─────────────────────────────────────────────

    @PutMapping("/{id}/assign")
    public ResponseEntity<ApiResponse<TicketResponse>> assignTechnician(
            @PathVariable Long id,
            @Valid @RequestBody AssignRequest request,
            @RequestHeader(value = "X-User-Email", defaultValue = "user@campus.lk") String userEmail) {

        return ResponseEntity.ok(
                ApiResponse.success("Technician assigned",
                        ticketService.assignTechnician(id, request, userEmail)));
    }

    // ─── DELETE ─────────────────────────────────────────────

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Email", defaultValue = "user@campus.lk") String userEmail) {

        ticketService.deleteTicket(id, userEmail);
        return ResponseEntity.noContent().build();
    }

    // ─── ACTIVITY FEED ──────────────────────────────────────

    @GetMapping("/{id}/activity")
    public ResponseEntity<ApiResponse<List<ActivityResponse>>> getActivity(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse.success("Activity feed",
                        ticketService.getActivityFeed(id)));
    }
}