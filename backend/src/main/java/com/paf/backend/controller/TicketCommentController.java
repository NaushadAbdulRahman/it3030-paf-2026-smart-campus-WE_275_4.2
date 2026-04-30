package com.paf.backend.controller;

import com.paf.backend.dto.request.CommentRequest;
import com.paf.backend.dto.response.ApiResponse;
import com.paf.backend.dto.response.CommentResponse;
import com.paf.backend.service.TicketCommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets/{ticketId}/comments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class TicketCommentController {

    private final TicketCommentService commentService;

    // ─── Add Comment ─────────────────────────────────────────

    @PostMapping
    public ResponseEntity<ApiResponse<CommentResponse>> addComment(
            @PathVariable Long ticketId,
            @Valid @RequestBody CommentRequest request,
            @RequestHeader(value = "X-User-Email", defaultValue = "user@campus.lk") String userEmail) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Comment added",
                        commentService.addComment(ticketId, request, userEmail)));
    }

    // ─── Get Comments ────────────────────────────────────────

    @GetMapping
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getComments(
            @PathVariable Long ticketId,
            @RequestHeader(value = "X-User-Email", defaultValue = "user@campus.lk") String userEmail) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        commentService.getComments(ticketId, userEmail)));
    }

    // ─── Update Comment ──────────────────────────────────────

    @PutMapping("/{commentId}")
    public ResponseEntity<ApiResponse<CommentResponse>> updateComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            @Valid @RequestBody CommentRequest request,
            @RequestHeader(value = "X-User-Email", defaultValue = "user@campus.lk") String userEmail) {

        return ResponseEntity.ok(
                ApiResponse.success("Comment updated",
                        commentService.updateComment(ticketId, commentId, request, userEmail)));
    }

    // ─── Delete Comment ──────────────────────────────────────

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            @RequestHeader(value = "X-User-Email", defaultValue = "user@campus.lk") String userEmail) {

        commentService.deleteComment(ticketId, commentId, userEmail);
        return ResponseEntity.noContent().build();
    }
}