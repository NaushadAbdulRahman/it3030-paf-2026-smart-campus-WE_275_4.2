package com.paf.backend.service;

import com.paf.backend.dto.request.CommentRequest;
import com.paf.backend.dto.response.CommentResponse;
import com.paf.backend.exception.CustomAccessDeniedException;
import com.paf.backend.exception.ResourceNotFoundException;
import com.paf.backend.model.NotificationType;
import com.paf.backend.model.Ticket;
import com.paf.backend.model.TicketComment;
import com.paf.backend.repository.TicketCommentRepository;
import com.paf.backend.repository.TicketRepository;
import com.paf.backend.repository.UserRepository;
import com.paf.backend.util.TicketMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TicketCommentService {

        private final TicketCommentRepository commentRepository;
        private final TicketRepository ticketRepository;
        private final UserRepository userRepository;
        private final TicketMapper ticketMapper;
        private final NotificationService notificationService;

        // ─── Add Comment ─────────────────────────────────────────

        public CommentResponse addComment(Long ticketId, CommentRequest request, String createdBy) {
                Ticket ticket = findTicketOrThrow(ticketId);

                TicketComment comment = TicketComment.builder()
                                .ticket(ticket)
                                .content(request.getContent())
                                .createdBy(createdBy)
                                .build();

                TicketComment saved = commentRepository.save(comment);

                // Notify other involved parties
                // If reporter comments, notify technician. If tech comments, notify reporter.
                String recipientEmail = createdBy.equals(ticket.getCreatedBy())
                                ? ticket.getAssignedTo()
                                : ticket.getCreatedBy();

                if (recipientEmail != null) {
                        userRepository.findByEmail(recipientEmail).ifPresent(recipient -> {
                                notificationService.notifyUser(
                                                recipient.getId(),
                                                NotificationType.NEW_COMMENT,
                                                "New Comment",
                                                createdBy + " commented on ticket: " + ticket.getTitle(),
                                                ticket.getId(),
                                                "TICKET");
                        });
                }

                return ticketMapper.toCommentResponse(
                                saved,
                                createdBy);
        }

        // ─── Get All Comments ────────────────────────────────────

        @Transactional(readOnly = true)
        public List<CommentResponse> getComments(Long ticketId, String currentUser) {
                findTicketOrThrow(ticketId);

                return commentRepository.findByTicket_IdOrderByCreatedAtAsc(ticketId)
                                .stream()
                                .map(c -> ticketMapper.toCommentResponse(c, currentUser))
                                .collect(Collectors.toList());
        }

        // ─── Edit Comment ────────────────────────────────────────

        public CommentResponse updateComment(Long ticketId, Long commentId,
                        CommentRequest request, String currentUser) {

                findTicketOrThrow(ticketId);

                TicketComment comment = commentRepository.findById(commentId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Comment not found: " + commentId));

                // ✅ Null-safe ownership check
                if (currentUser == null || !currentUser.equals(comment.getCreatedBy())) {
                        throw new CustomAccessDeniedException(
                                        "You can only edit your own comments");
                }

                comment.setContent(request.getContent());

                return ticketMapper.toCommentResponse(
                                commentRepository.save(comment),
                                currentUser);
        }

        // ─── Delete Comment ──────────────────────────────────────

        public void deleteComment(Long ticketId, Long commentId, String currentUser) {

                findTicketOrThrow(ticketId);

                TicketComment comment = commentRepository.findById(commentId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Comment not found: " + commentId));

                // ✅ Null-safe ownership check
                if (currentUser == null || !currentUser.equals(comment.getCreatedBy())) {
                        throw new CustomAccessDeniedException(
                                        "You can only delete your own comments");
                }

                commentRepository.delete(comment);
        }

        // ─── Helper ─────────────────────────────────────────────

        private Ticket findTicketOrThrow(Long ticketId) {
                return ticketRepository.findById(ticketId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Ticket not found with id: " + ticketId));
        }
}