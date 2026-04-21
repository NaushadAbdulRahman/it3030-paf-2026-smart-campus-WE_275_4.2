package com.paf.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AssignRequest {

    @NotBlank(message = "Technician ID is required")
    @Size(max = 255, message = "Technician ID must not exceed 255 characters")
    private String technicianId;
}