package com.paf.backend.repository;

import com.paf.backend.enums.BookingStatus;
import com.paf.backend.model.Booking;
import com.paf.backend.model.User;
import org.springframework.data.domain.Page;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    /** Detects time-slot conflicts for APPROVED bookings on the same resource & date. */
    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE " +
            "b.resource.id = :resourceId AND " +
            "b.date = :date AND " +
            "b.status = 'APPROVED' AND " +
            "b.startTime < :endTime AND b.endTime > :startTime")
    boolean existsConflict(
            @Param("resourceId") Long resourceId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime
    );

    @Query("SELECT b FROM Booking b WHERE " +
            "b.resource.id = :resourceId AND " +
            "b.date = :date AND " +
            "b.status IN :statuses AND " +
            "b.startTime < :endTime AND b.endTime > :startTime")
    List<Booking> findConflicts(
            @Param("resourceId") Long resourceId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("statuses") List<BookingStatus> statuses
    );

    Page<Booking> findByUser(User user, Pageable pageable);

    Page<Booking> findByUserAndStatus(User user, BookingStatus status, Pageable pageable);

    @Query("SELECT b FROM Booking b WHERE (:status IS NULL OR b.status = :status)")
    Page<Booking> findAllByOptionalStatus(@Param("status") BookingStatus status, Pageable pageable);

    Page<Booking> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    long countByStatus(BookingStatus status);

    long countByUser(User user);
}
