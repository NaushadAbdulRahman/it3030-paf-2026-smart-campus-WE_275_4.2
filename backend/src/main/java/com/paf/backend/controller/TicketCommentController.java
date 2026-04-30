package com.paf.backend.controller;

import com.paf.backend.dto.request.CommentRequest;
import com.paf.backend.dto.response.ApiResponse;
import com.paf.backend.dto.response.CommentResponse;
import com.paf.backend.security.SecurityHelper;
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
public class TicketCommentController {

    private final TicketCommentService commentService;
    private final SecurityHelper securityHelper;

    @PostMapping
    public ResponseEntity<ApiResponse<CommentResponse>> addComment(
            @PathVariable Long ticketId,
            @Valid @RequestBody CommentRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Comment added",
                        commentService.addComment(ticketId, request, securityHelper.getCurrentEmail())));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getComments(
            @PathVariable Long ticketId) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        commentService.getComments(ticketId, securityHelper.getCurrentEmail())));
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<ApiResponse<CommentResponse>> updateComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            @Valid @RequestBody CommentRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success("Comment updated",
                        commentService.updateComment(ticketId, commentId, request, securityHelper.getCurrentEmail())));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId) {

        commentService.deleteComment(ticketId, commentId, securityHelper.getCurrentEmail());
        return ResponseEntity.noContent().build();
    }
}
