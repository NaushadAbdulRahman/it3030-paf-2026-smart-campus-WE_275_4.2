package com.paf.backend.service;

import com.paf.backend.dto.response.NotificationResponse;
import com.paf.backend.model.NotificationType;
import org.springframework.data.domain.Page;

import java.util.Map;

public interface NotificationService {
    void notifyUser(Long userId, NotificationType type, String title, String message, Long relatedEntityId, String relatedEntityType);
    void notifyAllAdmins(NotificationType type, String title, String message, Long relatedEntityId, String relatedEntityType);
    Page<NotificationResponse> getNotificationsForUser(Long userId, int page, int size);
    Map<String, Long> getUnreadCount(Long userId);
    NotificationResponse markAsRead(Long notificationId, Long userId);
    void markAllAsRead(Long userId);
    void deleteNotification(Long notificationId, Long userId);
}
