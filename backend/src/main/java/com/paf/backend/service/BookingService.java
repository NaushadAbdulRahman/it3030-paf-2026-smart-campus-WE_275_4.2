package com.paf.backend.service;

import com.paf.backend.dto.request.BookingRequest;
import com.paf.backend.dto.response.BookingResponse;
import com.paf.backend.dto.response.PagedResponse;
import com.paf.backend.enums.BookingStatus;
import com.paf.backend.enums.ResourceStatus;
import com.paf.backend.enums.ResourceType;
import com.paf.backend.enums.Role;
import com.paf.backend.exception.BadRequestException;
import com.paf.backend.exception.ConflictException;
import com.paf.backend.exception.CustomAccessDeniedException;
import com.paf.backend.exception.ResourceNotFoundException;
import com.paf.backend.model.Booking;
import com.paf.backend.model.Resource;
import com.paf.backend.model.User;
import com.paf.backend.model.NotificationType;
import com.paf.backend.repository.BookingRepository;
import com.paf.backend.repository.ResourceRepository;
import com.paf.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // ─── CREATE ──────────────────────────────────────────────

    public BookingResponse createBooking(BookingRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Resource not found with id: " + request.getResourceId()));

        // 1. Resource must be ACTIVE
        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new BadRequestException(
                    "Resource '" + resource.getName() + "' is currently " +
                            resource.getStatus().name().toLowerCase().replace('_', ' ') +
                            " and cannot be booked");
        }

        // 2. Validate time window
        if (request.getEndTime().isBefore(request.getStartTime()) ||
                request.getEndTime().equals(request.getStartTime())) {
            throw new BadRequestException("End time must be after start time");
        }

        // 3. Check availability hours
        if (resource.getAvailabilityStart() != null && resource.getAvailabilityEnd() != null) {
            if (request.getStartTime().isBefore(resource.getAvailabilityStart()) ||
                    request.getEndTime().isAfter(resource.getAvailabilityEnd())) {
                throw new BadRequestException(
                        "Booking time is outside resource availability hours (" +
                                resource.getAvailabilityStart() + " – " +
                                resource.getAvailabilityEnd() + ")");
            }
        }

        // 4. Check capacity
        if (request.getExpectedAttendees() != null && resource.getCapacity() != null) {
            if (request.getExpectedAttendees() > resource.getCapacity()) {
                throw new BadRequestException(
                        "Expected attendees (" + request.getExpectedAttendees() +
                                ") exceeds resource capacity (" + resource.getCapacity() + ")");
            }
        }

        // 5. Conflict detection (pending or approved bookings on the same resource/date/time)
        List<Booking> conflicts = bookingRepository.findConflicts(
                resource.getId(),
                request.getDate(),
                request.getStartTime(),
                request.getEndTime(),
                List.of(BookingStatus.APPROVED, BookingStatus.PENDING)
        );

        if (!conflicts.isEmpty()) {
            Booking conflict = conflicts.get(0);
            String subject = resource.getType() == ResourceType.LECTURE_HALL ? "Hall" : "Resource";
            throw new ConflictException(
                    subject + " '" + resource.getName() + "' is unavailable on " + request.getDate() +
                            " from " + conflict.getStartTime() + " to " + conflict.getEndTime() +
                            " due to an existing " + conflict.getStatus().name().toLowerCase() + " booking.");
        }

        Booking booking = Booking.builder()
                .resource(resource)
                .user(user)
                .date(request.getDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose())
                .expectedAttendees(request.getExpectedAttendees())
                .status(BookingStatus.PENDING)
                .build();

        Booking saved = bookingRepository.save(booking);
        
        // Notify Admins
        notificationService.notifyAllAdmins(
                NotificationType.BOOKING_CANCELLED, // Using this for general booking activity if needed, but the plan said notify admins on new booking
                "New Booking Request",
                "User " + user.getName() + " requested " + resource.getName() + " on " + request.getDate(),
                saved.getId(),
                "BOOKING"
        );

        return toResponse(saved);
    }

    // ─── GET MY BOOKINGS ─────────────────────────────────────

    @Transactional(readOnly = true)
    public PagedResponse<BookingResponse> getMyBookings(
            String userEmail, BookingStatus status, int page, int size) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Booking> result = (status != null)
                ? bookingRepository.findByUserAndStatus(user, status, pageable)
                : bookingRepository.findByUser(user, pageable);

        return toPagedResponse(result);
    }

    // ─── GET ALL BOOKINGS (ADMIN) ────────────────────────────

    @Transactional(readOnly = true)
    public PagedResponse<BookingResponse> getAllBookings(
            BookingStatus status, int page, int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Booking> result = bookingRepository.findAllByOptionalStatus(status, pageable);

        return toPagedResponse(result);
    }

    // ─── GET BY ID ───────────────────────────────────────────

    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id, String userEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Users can only see their own bookings; Admins/Techs see all
        if (user.getRole() == Role.USER && !booking.getUser().getId().equals(user.getId())) {
            throw new CustomAccessDeniedException("You can only view your own bookings");
        }

        return toResponse(booking);
    }

    // ─── APPROVE ─────────────────────────────────────────────

    public BookingResponse approveBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only PENDING bookings can be approved");
        }

        // Re-check conflict before approval
        boolean hasConflict = bookingRepository.existsConflict(
                booking.getResource().getId(),
                booking.getDate(),
                booking.getStartTime(),
                booking.getEndTime()
        );

        if (hasConflict) {
            throw new ConflictException(
                    "Cannot approve — another booking was approved for this time slot");
        }

        booking.setStatus(BookingStatus.APPROVED);
        Booking saved = bookingRepository.save(booking);

        // Notify User
        notificationService.notifyUser(
                saved.getUser().getId(),
                NotificationType.BOOKING_APPROVED,
                "Booking Approved",
                "Your booking for " + saved.getResource().getName() + " on " + saved.getDate() + " has been approved.",
                saved.getId(),
                "BOOKING"
        );

        return toResponse(saved);
    }

    // ─── REJECT ──────────────────────────────────────────────

    public BookingResponse rejectBooking(Long id, String reason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only PENDING bookings can be rejected");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        Booking saved = bookingRepository.save(booking);

        // Notify User
        notificationService.notifyUser(
                saved.getUser().getId(),
                NotificationType.BOOKING_REJECTED,
                "Booking Rejected",
                "Your booking for " + saved.getResource().getName() + " on " + saved.getDate() + " was rejected. Reason: " + reason,
                saved.getId(),
                "BOOKING"
        );

        return toResponse(saved);
    }

    // ─── CANCEL ──────────────────────────────────────────────

    public BookingResponse cancelBooking(Long id, String userEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Only owner or ADMIN can cancel
        if (user.getRole() != Role.ADMIN && !booking.getUser().getId().equals(user.getId())) {
            throw new CustomAccessDeniedException("You can only cancel your own bookings");
        }

        // Can only cancel PENDING or APPROVED
        if (booking.getStatus() != BookingStatus.PENDING &&
                booking.getStatus() != BookingStatus.APPROVED) {
            throw new BadRequestException("Only PENDING or APPROVED bookings can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);

        // If a user cancels, notify Admin
        if (user.getRole() != Role.ADMIN) {
            notificationService.notifyAllAdmins(
                    NotificationType.BOOKING_CANCELLED,
                    "Booking Cancelled",
                    "User " + user.getName() + " cancelled their booking for " + saved.getResource().getName(),
                    saved.getId(),
                    "BOOKING"
            );
        }

        return toResponse(saved);
    }

    // ─── STATS ───────────────────────────────────────────────

    @Transactional(readOnly = true)
    public long countByStatus(BookingStatus status) {
        return bookingRepository.countByStatus(status);
    }

    // ─── MAPPERS ─────────────────────────────────────────────

    private BookingResponse toResponse(Booking b) {
        Resource r = b.getResource();
        User u = b.getUser();

        return BookingResponse.builder()
                .id(b.getId())
                .resourceId(r.getId())
                .resourceName(r.getName())
                .resourceType(r.getType())
                .resourceLocation(r.getLocation())
                .resourceCapacity(r.getCapacity())
                .resourceStatus(r.getStatus())
                .userId(u.getId())
                .userName(u.getName())
                .userEmail(u.getEmail())
                .date(b.getDate())
                .startTime(b.getStartTime())
                .endTime(b.getEndTime())
                .purpose(b.getPurpose())
                .expectedAttendees(b.getExpectedAttendees())
                .status(b.getStatus())
                .rejectionReason(b.getRejectionReason())
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt())
                .build();
    }

    private PagedResponse<BookingResponse> toPagedResponse(Page<Booking> page) {
        return PagedResponse.<BookingResponse>builder()
                .content(page.getContent().stream()
                        .map(this::toResponse)
                        .collect(Collectors.toList()))
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
