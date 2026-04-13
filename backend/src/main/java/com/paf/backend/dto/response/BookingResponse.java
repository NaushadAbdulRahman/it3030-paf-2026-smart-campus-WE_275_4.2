package com.paf.backend.dto.response;

import com.paf.backend.enums.BookingStatus;
import com.paf.backend.enums.ResourceStatus;
import com.paf.backend.enums.ResourceType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
public class BookingResponse {

    private Long id;

    // Embedded resource info
    private Long resourceId;
    private String resourceName;
    private ResourceType resourceType;
    private String resourceLocation;
    private Integer resourceCapacity;
    private ResourceStatus resourceStatus;

    // Embedded user info
    private Long userId;
    private String userName;
    private String userEmail;

    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String purpose;
    private Integer expectedAttendees;

    private BookingStatus status;
    private String rejectionReason;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
