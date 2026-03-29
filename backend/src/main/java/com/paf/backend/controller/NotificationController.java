package com.paf.backend.controller;

import com.paf.backend.dto.response.NotificationResponse;
import com.paf.backend.security.SecurityHelper;
import com.paf.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class NotificationController {

    private final NotificationService notificationService;
    private final SecurityHelper securityHelper;

    @GetMapping
    public ResponseEntity<Page<NotificationResponse>> getMyNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = securityHelper.getCurrentUser().getId();
        return ResponseEntity.ok(notificationService.getNotificationsForUser(userId, page, size));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        Long userId = securityHelper.getCurrentUser().getId();
        return ResponseEntity.ok(notificationService.getUnreadCount(userId));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable Long id) {
        Long userId = securityHelper.getCurrentUser().getId();
        return ResponseEntity.ok(notificationService.markAsRead(id, userId));
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        Long userId = securityHelper.getCurrentUser().getId();
        notificationService.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        Long userId = securityHelper.getCurrentUser().getId();
        notificationService.deleteNotification(id, userId);
        return ResponseEntity.noContent().build();
    }
}
