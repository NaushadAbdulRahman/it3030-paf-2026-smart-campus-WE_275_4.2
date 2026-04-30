package com.paf.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CommentResponse {

    private Long id;
    private Long ticketId;

    private String content;
    private String createdBy;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private boolean editable;
}