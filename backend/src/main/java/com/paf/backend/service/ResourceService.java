package com.paf.backend.service;

import com.paf.backend.dto.request.ResourceRequest;
import com.paf.backend.dto.response.PagedResponse;
import com.paf.backend.dto.response.ResourceResponse;
import com.paf.backend.enums.ResourceStatus;
import com.paf.backend.enums.ResourceType;
import com.paf.backend.exception.ResourceNotFoundException;
import com.paf.backend.model.Resource;
import com.paf.backend.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ResourceService {

    private final ResourceRepository resourceRepository;

    // ─── SEARCH / LIST ───────────────────────────────────────

    @Transactional(readOnly = true)
    public PagedResponse<ResourceResponse> searchResources(
            ResourceType type,
            String location,
            Integer minCapacity,
            ResourceStatus status,
            int page,
            int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Resource> result = resourceRepository.searchResources(
                type, location, minCapacity, status, pageable);

        return PagedResponse.<ResourceResponse>builder()
                .content(result.getContent().stream()
                        .map(this::toResponse)
                        .collect(Collectors.toList()))
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .last(result.isLast())
                .build();
    }

    // ─── GET BY ID ───────────────────────────────────────────

    @Transactional(readOnly = true)
    public ResourceResponse getResourceById(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Resource not found with id: " + id));
        return toResponse(resource);
    }

    // ─── CREATE ──────────────────────────────────────────────

    public ResourceResponse createResource(ResourceRequest request) {
        Resource resource = Resource.builder()
                .name(request.getName())
                .type(request.getType())
                .capacity(request.getCapacity())
                .location(request.getLocation())
                .description(request.getDescription())
                .availabilityStart(request.getAvailabilityStart())
                .availabilityEnd(request.getAvailabilityEnd())
                .status(request.getStatus() != null ? request.getStatus() : ResourceStatus.ACTIVE)
                .build();

        return toResponse(resourceRepository.save(resource));
    }

    // ─── UPDATE ──────────────────────────────────────────────

    public ResourceResponse updateResource(Long id, ResourceRequest request) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Resource not found with id: " + id));

        resource.setName(request.getName());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation());
        resource.setDescription(request.getDescription());
        resource.setAvailabilityStart(request.getAvailabilityStart());
        resource.setAvailabilityEnd(request.getAvailabilityEnd());

        if (request.getStatus() != null) {
            resource.setStatus(request.getStatus());
        }

        return toResponse(resourceRepository.save(resource));
    }

    // ─── DELETE (soft) ───────────────────────────────────────

    public void deleteResource(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Resource not found with id: " + id));

        resource.setStatus(ResourceStatus.OUT_OF_SERVICE);
        resourceRepository.save(resource);
    }

    // ─── MAPPER ──────────────────────────────────────────────

    private ResourceResponse toResponse(Resource r) {
        return ResourceResponse.builder()
                .id(r.getId())
                .name(r.getName())
                .type(r.getType())
                .capacity(r.getCapacity())
                .location(r.getLocation())
                .description(r.getDescription())
                .availabilityStart(r.getAvailabilityStart())
                .availabilityEnd(r.getAvailabilityEnd())
                .status(r.getStatus())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}
