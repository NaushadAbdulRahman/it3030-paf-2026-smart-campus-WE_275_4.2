package com.paf.backend.controller;

import com.paf.backend.dto.request.BookingActionRequest;
import com.paf.backend.dto.request.BookingRequest;
import com.paf.backend.dto.response.ApiResponse;
import com.paf.backend.dto.response.BookingResponse;
import com.paf.backend.dto.response.PagedResponse;
import com.paf.backend.enums.BookingStatus;
import com.paf.backend.enums.Role;
import com.paf.backend.model.User;
import com.paf.backend.security.SecurityHelper;
import com.paf.backend.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class BookingController {

    private final BookingService bookingService;
    private final SecurityHelper securityHelper;

    /**
     * POST /api/bookings — Create a new booking (any authenticated user)
     */
    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody BookingRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Booking created — awaiting approval",
                        bookingService.createBooking(request, securityHelper.getCurrentEmail())));
    }

    /**
     * GET /api/bookings — Get bookings:
     *   ADMIN → all bookings (filterable by status)
     *   USER/TECHNICIAN → own bookings only
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<BookingResponse>>> getBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        User currentUser = securityHelper.getCurrentUser();
        PagedResponse<BookingResponse> result;

        if (currentUser.getRole() == Role.ADMIN) {
            result = bookingService.getAllBookings(status, page, size);
        } else {
            result = bookingService.getMyBookings(currentUser.getEmail(), status, page, size);
        }

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * GET /api/bookings/{id} — Get a specific booking
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBooking(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        bookingService.getBookingById(id, securityHelper.getCurrentEmail())));
    }

    /**
     * PUT /api/bookings/{id}/approve — ADMIN only
     */
    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<BookingResponse>> approveBooking(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Booking approved",
                        bookingService.approveBooking(id)));
    }

    /**
     * PUT /api/bookings/{id}/reject — ADMIN only
     */
    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<BookingResponse>> rejectBooking(
            @PathVariable Long id,
            @RequestBody BookingActionRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success("Booking rejected",
                        bookingService.rejectBooking(id, request.getReason())));
    }

    /**
     * PUT /api/bookings/{id}/cancel — owner or ADMIN
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Booking cancelled",
                        bookingService.cancelBooking(id, securityHelper.getCurrentEmail())));
    }

    /**
     * GET /api/bookings/stats — Booking count by status (for dashboard)
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getStats() {
        Map<String, Long> stats = Map.of(
                "pending", bookingService.countByStatus(BookingStatus.PENDING),
                "approved", bookingService.countByStatus(BookingStatus.APPROVED),
                "rejected", bookingService.countByStatus(BookingStatus.REJECTED),
                "cancelled", bookingService.countByStatus(BookingStatus.CANCELLED)
        );
        return ResponseEntity.ok(ApiResponse.success("Booking stats", stats));
    }
}
