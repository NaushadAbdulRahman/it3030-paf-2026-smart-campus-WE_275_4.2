package com.paf.backend.repository;

import com.paf.backend.enums.TicketCategory;
import com.paf.backend.enums.TicketPriority;
import com.paf.backend.enums.TicketStatus;
import com.paf.backend.model.Ticket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    // Get all tickets by creator (for regular users)
    Page<Ticket> findByCreatedBy(String createdBy, Pageable pageable);

    // Filter by status
    Page<Ticket> findByStatus(TicketStatus status, Pageable pageable);

    // Filter by status and creator
    Page<Ticket> findByStatusAndCreatedBy(TicketStatus status, String createdBy, Pageable pageable);

    // Filter by priority
    Page<Ticket> findByPriority(TicketPriority priority, Pageable pageable);

    // Filter by category
    Page<Ticket> findByCategory(TicketCategory category, Pageable pageable);

    // Filter by assigned technician
    Page<Ticket> findByAssignedTo(String assignedTo, Pageable pageable);

    // Innovation 3: find all SLA-breached tickets
    List<Ticket> findByIsSlaBreachedTrueAndStatusNotIn(List<TicketStatus> excludedStatuses);

    // Innovation 3: find tickets past SLA deadline that aren't already marked breached
    List<Ticket> findBySlaDeadlineBeforeAndIsSlaBreachedFalseAndStatusNotIn(
            LocalDateTime now, List<TicketStatus> excludedStatuses);

    // Innovation 4: duplicate detection - open tickets for same resource
    List<Ticket> findByResourceIdAndStatusIn(String resourceId, List<TicketStatus> statuses);

    // Innovation 7: analytics - count by category
    @Query("SELECT t.category, COUNT(t) FROM Ticket t GROUP BY t.category")
    List<Object[]> countByCategory();

    // Innovation 7: analytics - count by status
    @Query("SELECT t.status, COUNT(t) FROM Ticket t GROUP BY t.status")
    List<Object[]> countByStatus();

    // Innovation 7: count tickets per technician for workload
    @Query("SELECT t.assignedTo, COUNT(t) FROM Ticket t WHERE t.assignedTo IS NOT NULL AND t.status IN :statuses GROUP BY t.assignedTo")
    List<Object[]> countByAssignedToAndStatusIn(@Param("statuses") List<TicketStatus> statuses);

    // Innovation 7: peak hours analytics
    @Query("SELECT HOUR(t.createdAt), COUNT(t) FROM Ticket t GROUP BY HOUR(t.createdAt) ORDER BY HOUR(t.createdAt)")
    List<Object[]> countByHourOfDay();

    // Innovation 7: resolution over time (last 30 days)
    @Query("SELECT DATE(t.updatedAt), COUNT(t) FROM Ticket t WHERE t.status = 'RESOLVED' AND t.updatedAt >= :since GROUP BY DATE(t.updatedAt)")
    List<Object[]> countResolvedByDay(@Param("since") LocalDateTime since);

    // Count tickets assigned to technician with active statuses
    long countByAssignedToAndStatusIn(String assignedTo, List<TicketStatus> statuses);
}