package com.paf.backend.controller;

import com.paf.backend.dto.request.CaptionUpdateRequest;
import com.paf.backend.dto.response.ApiResponse;
import com.paf.backend.dto.response.AttachmentResponse;
import com.paf.backend.security.SecurityHelper;
import com.paf.backend.service.TicketAttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/tickets/{ticketId}/attachments")
@RequiredArgsConstructor
public class TicketAttachmentController {

    private final TicketAttachmentService attachmentService;
    private final SecurityHelper securityHelper;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<AttachmentResponse>> uploadAttachment(
            @PathVariable Long ticketId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "caption", required = false) String caption)
            throws IOException {

        return ResponseEntity.status(201)
                .body(ApiResponse.success("Attachment uploaded successfully",
                        attachmentService.upload(ticketId, file, caption, securityHelper.getCurrentEmail())));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AttachmentResponse>>> getAttachments(
            @PathVariable Long ticketId) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        attachmentService.getAttachments(ticketId)));
    }

    @GetMapping("/{attachmentId}/file")
    public ResponseEntity<Resource> serveFile(
            @PathVariable Long ticketId,
            @PathVariable Long attachmentId) {

        Resource resource = attachmentService.serveFile(ticketId, attachmentId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + resource.getFilename() + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

    @PatchMapping("/{attachmentId}")
    public ResponseEntity<ApiResponse<AttachmentResponse>> updateCaption(
            @PathVariable Long ticketId,
            @PathVariable Long attachmentId,
            @RequestBody CaptionUpdateRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success("Caption updated",
                        attachmentService.updateCaption(
                                ticketId, attachmentId, request.getCaption(), securityHelper.getCurrentEmail())));
    }

    @DeleteMapping("/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable Long ticketId,
            @PathVariable Long attachmentId) {

        attachmentService.deleteAttachment(ticketId, attachmentId, securityHelper.getCurrentEmail());
        return ResponseEntity.noContent().build();
    }
}
