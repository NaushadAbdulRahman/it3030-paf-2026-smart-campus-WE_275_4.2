package com.paf.backend.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CaptionUpdateRequest {

    @Size(max = 500, message = "Caption must not exceed 500 characters")
    private String caption;
}