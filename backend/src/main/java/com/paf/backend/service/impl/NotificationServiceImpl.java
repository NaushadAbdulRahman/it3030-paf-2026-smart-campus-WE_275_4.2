package com.paf.backend.service.impl;

import com.paf.backend.dto.response.NotificationResponse;
import com.paf.backend.exception.ResourceNotFoundException;
import com.paf.backend.model.Notification;
import com.paf.backend.model.NotificationType;
import com.paf.backend.enums.Role;
import com.paf.backend.model.User;
import com.paf.backend.repository.NotificationRepository;
import com.paf.backend.repository.UserRepository;
import com.paf.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void notifyUser(Long userId, NotificationType type, String title, String message, Long relatedEntityId, String relatedEntityType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Notification notification = Notification.builder()
                .recipient(user)
                .type(type)
                .title(title)
                .message(message)
                .relatedEntityId(relatedEntityId)
                .relatedEntityType(relatedEntityType)
                .isRead(false)
                .build();

        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void notifyAllAdmins(NotificationType type, String title, String message, Long relatedEntityId, String relatedEntityType) {
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        for (User admin : admins) {
            notifyUser(admin.getId(), type, title, message, relatedEntityId, relatedEntityType);
        }
    }

    @Override
    public Page<NotificationResponse> getNotificationsForUser(Long userId, int page, int size) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user, PageRequest.of(page, size))
                .map(this::mapToResponse);
    }

    @Override
    public Map<String, Long> getUnreadCount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Long count = notificationRepository.countByRecipientAndIsReadFalse(user);
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return response;
    }

    @Override
    @Transactional
    public NotificationResponse markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getRecipient().getId().equals(userId)) {
            throw new AccessDeniedException("You can only mark your own notifications as read");
        }

        notification.setRead(true);
        return mapToResponse(notificationRepository.save(notification));
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Notification> unread = notificationRepository.findByRecipientAndIsReadFalse(user);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    @Override
    @Transactional
    public void deleteNotification(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getRecipient().getId().equals(userId)) {
            throw new AccessDeniedException("You can only delete your own notifications");
        }

        notificationRepository.delete(notification);
    }

    private NotificationResponse mapToResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType())
                .title(n.getTitle())
                .message(n.getMessage())
                .relatedEntityId(n.getRelatedEntityId())
                .relatedEntityType(n.getRelatedEntityType())
                .isRead(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
