package com.paf.backend.service;

import com.paf.backend.dto.response.WorkloadResponse;
import com.paf.backend.enums.TicketStatus;
import com.paf.backend.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final TicketRepository ticketRepository;

    // ─── Tickets by Category ────────────────────────────────

    public Map<String, Long> getTicketsByCategory() {
        Map<String, Long> result = new LinkedHashMap<>();

        ticketRepository.countByCategory()
                .forEach(row -> result.put(
                        row[0].toString(),
                        ((Number) row[1]).longValue()
                ));

        return result;
    }

    // ─── Tickets by Status ─────────────────────────────────

    public Map<String, Long> getTicketsByStatus() {
        Map<String, Long> result = new LinkedHashMap<>();

        ticketRepository.countByStatus()
                .forEach(row -> result.put(
                        row[0].toString(),
                        ((Number) row[1]).longValue()
                ));

        return result;
    }

    // ─── Resolution Over Time (last 30 days) ───────────────

    public Map<String, Long> getResolutionOverTime() {
        LocalDateTime since = LocalDateTime.now().minusDays(30);
        Map<String, Long> result = new LinkedHashMap<>();

        ticketRepository.countResolvedByDay(since)
                .forEach(row -> result.put(
                        row[0].toString(),
                        ((Number) row[1]).longValue()
                ));

        return result;
    }

    // ─── Peak Hours ────────────────────────────────────────

    public Map<String, Long> getPeakHours() {
        Map<String, Long> result = new LinkedHashMap<>();

        ticketRepository.countByHourOfDay()
                .forEach(row -> {
                    int hour = ((Number) row[0]).intValue();
                    String label = String.format("%02d:00", hour);

                    result.put(label, ((Number) row[1]).longValue());
                });

        return result;
    }

    // ─── Technician Workload ───────────────────────────────

    public List<WorkloadResponse> getTechnicianWorkloads() {

        Map<String, Long> openCounts = new HashMap<>();
        ticketRepository.countByAssignedToAndStatusIn(
                        List.of(TicketStatus.OPEN))
                .forEach(row -> openCounts.put(
                        row[0] != null ? row[0].toString() : "UNASSIGNED",
                        ((Number) row[1]).longValue()
                ));

        Map<String, Long> inProgressCounts = new HashMap<>();
        ticketRepository.countByAssignedToAndStatusIn(
                        List.of(TicketStatus.IN_PROGRESS))
                .forEach(row -> inProgressCounts.put(
                        row[0] != null ? row[0].toString() : "UNASSIGNED",
                        ((Number) row[1]).longValue()
                ));

        Map<String, Long> resolvedCounts = new HashMap<>();
        ticketRepository.countByAssignedToAndStatusIn(
                        List.of(TicketStatus.RESOLVED))
                .forEach(row -> resolvedCounts.put(
                        row[0] != null ? row[0].toString() : "UNASSIGNED",
                        ((Number) row[1]).longValue()
                ));

        Set<String> allTechnicians = new HashSet<>();
        allTechnicians.addAll(openCounts.keySet());
        allTechnicians.addAll(inProgressCounts.keySet());
        allTechnicians.addAll(resolvedCounts.keySet());

        return allTechnicians.stream()
                .map(techId -> {
                    long open = openCounts.getOrDefault(techId, 0L);
                    long inProgress = inProgressCounts.getOrDefault(techId, 0L);
                    long resolved = resolvedCounts.getOrDefault(techId, 0L);
                    long total = open + inProgress;

                    return WorkloadResponse.builder()
                            .technicianId(techId)
                            .openCount(open)
                            .inProgressCount(inProgress)
                            .resolvedCount(resolved)
                            .totalActive(total)
                            .workloadLevel(classifyWorkload(total))
                            .build();
                })
                // ✅ busiest first
                .sorted(Comparator.comparingLong(WorkloadResponse::getTotalActive).reversed())
                .collect(Collectors.toList());
    }

    // ─── Suggest Technician ────────────────────────────────

    public Optional<String> suggestTechnician() {
        List<TicketStatus> activeStatuses =
                List.of(TicketStatus.OPEN, TicketStatus.IN_PROGRESS);

        return ticketRepository.countByAssignedToAndStatusIn(activeStatuses)
                .stream()
                .min(Comparator.comparingLong(row -> ((Number) row[1]).longValue()))
                .map(row -> row[0] != null ? row[0].toString() : null);
    }

    // ─── Helper ────────────────────────────────────────────

    private String classifyWorkload(long totalActive) {
        if (totalActive <= 2) return "LOW";
        if (totalActive <= 5) return "MODERATE";
        return "HIGH";
    }
}