package com.paf.backend.controller;

import com.paf.backend.dto.request.ResourceRequest;
import com.paf.backend.dto.response.ApiResponse;
import com.paf.backend.dto.response.PagedResponse;
import com.paf.backend.dto.response.ResourceResponse;
import com.paf.backend.enums.ResourceStatus;
import com.paf.backend.enums.ResourceType;
import com.paf.backend.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<ResourceResponse>>> getResources(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) ResourceStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        resourceService.searchResources(type, location, minCapacity, status, page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResourceResponse>> getResource(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success(resourceService.getResourceById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ResourceResponse>> createResource(
            @Valid @RequestBody ResourceRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Resource created successfully",
                        resourceService.createResource(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ResourceResponse>> updateResource(
            @PathVariable Long id,
            @Valid @RequestBody ResourceRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success("Resource updated",
                        resourceService.updateResource(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}
