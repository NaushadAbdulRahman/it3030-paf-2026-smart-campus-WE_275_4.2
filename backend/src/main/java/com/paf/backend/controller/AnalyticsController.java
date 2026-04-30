package com.paf.backend.controller;

import com.paf.backend.dto.response.ApiResponse;
import com.paf.backend.dto.response.WorkloadResponse;
import com.paf.backend.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/analytics") // ✅ base path
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    // ─── Tickets by Category ────────────────────────────────

    @GetMapping("/tickets/by-category")
    public ResponseEntity<ApiResponse<Map<String, Long>>> byCategory() {
        return ResponseEntity.ok(
                ApiResponse.success("Tickets by category",
                        analyticsService.getTicketsByCategory()));
    }

    // ─── Tickets by Status ─────────────────────────────────

    @GetMapping("/tickets/by-status")
    public ResponseEntity<ApiResponse<Map<String, Long>>> byStatus() {
        return ResponseEntity.ok(
                ApiResponse.success("Tickets by status",
                        analyticsService.getTicketsByStatus()));
    }

    // ─── Resolution Over Time ───────────────────────────────

    @GetMapping("/tickets/resolution")
    public ResponseEntity<ApiResponse<Map<String, Long>>> resolutionOverTime() {
        return ResponseEntity.ok(
                ApiResponse.success("Resolution over time",
                        analyticsService.getResolutionOverTime()));
    }

    // ─── Peak Hours ────────────────────────────────────────

    @GetMapping("/tickets/peak-hours")
    public ResponseEntity<ApiResponse<Map<String, Long>>> peakHours() {
        return ResponseEntity.ok(
                ApiResponse.success("Peak hours",
                        analyticsService.getPeakHours()));
    }

    // ─── Technician Workload ───────────────────────────────

    @GetMapping("/technicians/workload")
    public ResponseEntity<ApiResponse<List<WorkloadResponse>>> technicianWorkload() {
        return ResponseEntity.ok(
                ApiResponse.success("Technician workload",
                        analyticsService.getTechnicianWorkloads()));
    }

    // ─── Suggest Technician ────────────────────────────────

    @GetMapping("/technicians/suggest")
    public ResponseEntity<ApiResponse<Map<String, String>>> suggestTechnician() {
        Optional<String> suggestion = analyticsService.suggestTechnician();

        Map<String, String> result = suggestion
                .map(id -> Map.of("suggestedTechnicianId", id))
                .orElse(Map.of("suggestedTechnicianId", ""));

        return ResponseEntity.ok(
                ApiResponse.success("Technician suggestion", result));
    }
}
