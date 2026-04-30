package com.paf.backend.dto.request;

import lombok.Data;

@Data
public class BookingActionRequest {
    /** Required only when rejecting a booking. */
    private String reason;
}
