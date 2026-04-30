package com.paf.backend.service;

import com.paf.backend.dto.response.AttachmentResponse;
import com.paf.backend.exception.CustomAccessDeniedException;
import com.paf.backend.exception.MaxAttachmentsException;
import com.paf.backend.exception.ResourceNotFoundException;
import com.paf.backend.model.Ticket;
import com.paf.backend.model.TicketAttachment;
import com.paf.backend.repository.TicketAttachmentRepository;
import com.paf.backend.repository.TicketRepository;
import com.paf.backend.util.FileStorageUtil;
import com.paf.backend.util.TicketMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TicketAttachmentService {

    private final TicketAttachmentRepository attachmentRepository;
    private final TicketRepository ticketRepository;
    private final FileStorageUtil fileStorageUtil;
    private final TicketMapper ticketMapper;

    @Value("${app.max.attachments:3}")
    private int maxAttachments;

    // ─── Upload ─────────────────────────────────────────────

    public AttachmentResponse upload(Long ticketId, MultipartFile file,
                                     String caption, String uploadedBy) throws IOException {

        Ticket ticket = findTicketOrThrow(ticketId);

        long currentCount = attachmentRepository.countByTicket_Id(ticketId);
        if (currentCount >= maxAttachments) {
            throw new MaxAttachmentsException(
                    "Max " + maxAttachments + " attachments allowed. Current: " + currentCount);
        }

        String relativePath = fileStorageUtil.store(file, String.valueOf(ticketId));

        TicketAttachment attachment = TicketAttachment.builder()
                .ticket(ticket)
                .fileName(file.getOriginalFilename())
                .filePath(relativePath)
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .caption(caption)
                .uploadedBy(uploadedBy)
                .build();

        return ticketMapper.toAttachmentResponse(
                attachmentRepository.save(attachment)
        );
    }

    // ─── List ───────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AttachmentResponse> getAttachments(Long ticketId) {
        findTicketOrThrow(ticketId);

        return attachmentRepository.findByTicket_Id(ticketId)
                .stream()
                .map(ticketMapper::toAttachmentResponse)
                .collect(Collectors.toList());
    }

    // ─── Serve File ─────────────────────────────────────────

    @Transactional(readOnly = true)
    public Resource serveFile(Long ticketId, Long attachmentId) {

        findTicketOrThrow(ticketId);

        TicketAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Attachment not found: " + attachmentId));

        try {
            Path filePath = fileStorageUtil.load(attachment.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                throw new ResourceNotFoundException("File not found");
            }

            return resource;

        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("File error: " + ex.getMessage());
        }
    }

    // ─── Update Caption ─────────────────────────────────────

    public AttachmentResponse updateCaption(Long ticketId, Long attachmentId,
                                            String caption, String currentUser) {

        findTicketOrThrow(ticketId);

        TicketAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Attachment not found: " + attachmentId));

        if (currentUser == null || !currentUser.equals(attachment.getUploadedBy())) {
            throw new CustomAccessDeniedException(
                    "You can only edit your own attachments");
        }

        attachment.setCaption(caption);

        return ticketMapper.toAttachmentResponse(
                attachmentRepository.save(attachment)
        );
    }

    // ─── Delete ─────────────────────────────────────────────

    public void deleteAttachment(Long ticketId, Long attachmentId, String currentUser) {

        findTicketOrThrow(ticketId);

        TicketAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Attachment not found: " + attachmentId));

        if (currentUser == null || !currentUser.equals(attachment.getUploadedBy())) {
            throw new CustomAccessDeniedException(
                    "You can only delete your own attachments");
        }

        fileStorageUtil.delete(attachment.getFilePath());
        attachmentRepository.delete(attachment);
    }

    // ─── Helper ─────────────────────────────────────────────

    private Ticket findTicketOrThrow(Long ticketId) {
        return ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Ticket not found with id: " + ticketId));
    }
}