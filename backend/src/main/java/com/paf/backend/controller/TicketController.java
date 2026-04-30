package com.paf.backend.controller;

import com.paf.backend.dto.request.AssignRequest;
import com.paf.backend.dto.request.StatusUpdateRequest;
import com.paf.backend.dto.request.TicketRequest;
import com.paf.backend.dto.response.*;
import com.paf.backend.enums.Role;
import com.paf.backend.model.User;
import com.paf.backend.security.SecurityHelper;
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
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
public class TicketController {

        private final TicketService ticketService;
        private final SecurityHelper securityHelper;

        // ─── CREATE ─────────────────────────────────────────────

        @PostMapping
        public ResponseEntity<ApiResponse<TicketResponse>> createTicket(
                        @Valid @RequestBody TicketRequest request) {

                String userEmail = securityHelper.getCurrentEmail();

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
                        @RequestParam(defaultValue = "false") boolean myTickets) {

                User currentUser = securityHelper.getCurrentUser();
                String userEmail = currentUser != null ? currentUser.getEmail() : "anonymous";
                Role role = currentUser != null ? currentUser.getRole() : Role.USER;

                PagedResponse<TicketResponse> tickets;

                if (role == Role.USER || myTickets) {
                        tickets = ticketService.getMyTickets(userEmail, page, size);
                } else {
                        tickets = ticketService.getAllTickets(page, size, sortBy);
                }

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
                        @PathVariable Long id) {

                String userEmail = securityHelper.getCurrentEmail();

                return ResponseEntity.ok(
                                ApiResponse.success(
                                                ticketService.getTicketById(id, userEmail)));
        }

        // ─── UPDATE ─────────────────────────────────────────────

        @PutMapping("/{id}")
        public ResponseEntity<ApiResponse<TicketResponse>> updateTicket(
                        @PathVariable Long id,
                        @Valid @RequestBody TicketRequest request) {

                String userEmail = securityHelper.getCurrentEmail();

                return ResponseEntity.ok(
                                ApiResponse.success("Ticket updated",
                                                ticketService.updateTicket(id, request, userEmail)));
        }

        // ─── UPDATE STATUS ──────────────────────────────────────

        @PutMapping("/{id}/status")
        public ResponseEntity<ApiResponse<TicketResponse>> updateStatus(
                        @PathVariable Long id,
                        @Valid @RequestBody StatusUpdateRequest request) {

                User currentUser = securityHelper.getCurrentUser();
                ticketService.validateStatusUpdatePermission(id, currentUser);

                return ResponseEntity.ok(
                                ApiResponse.success("Status updated",
                                                ticketService.updateStatus(id, request, currentUser.getEmail())));
        }

        // ─── ASSIGN ─────────────────────────────────────────────

        @PutMapping("/{id}/assign")
        public ResponseEntity<ApiResponse<TicketResponse>> assignTechnician(
                        @PathVariable Long id,
                        @Valid @RequestBody AssignRequest request) {

                User currentUser = securityHelper.getCurrentUser();
                ticketService.validateAssignPermission(currentUser);

                return ResponseEntity.ok(
                                ApiResponse.success("Technician assigned",
                                                ticketService.assignTechnician(id, request, currentUser.getEmail())));
        }

        // ─── DELETE ─────────────────────────────────────────────

        @DeleteMapping("/{id}")
        public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {

                User currentUser = securityHelper.getCurrentUser();
                ticketService.deleteTicket(id, currentUser.getEmail(), currentUser.getRole());
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