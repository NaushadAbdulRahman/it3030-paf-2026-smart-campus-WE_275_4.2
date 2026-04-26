package com.paf.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AttachmentResponse {

    private Long id;
    private Long ticketId;

    private String fileName;
    private String fileType;
    private Long fileSize;

    private String caption;
    private String uploadedBy;

    private LocalDateTime uploadedAt;

    private String downloadUrl;
}