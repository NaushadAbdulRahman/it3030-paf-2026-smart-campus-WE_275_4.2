package com.paf.backend.repository;

import com.paf.backend.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByResourceIdAndBookingDate(Long resourceId, LocalDate bookingDate);
}
