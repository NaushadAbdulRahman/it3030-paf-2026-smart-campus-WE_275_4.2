package com.paf.backend.repository;

import com.paf.backend.model.Notification;
import com.paf.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByRecipientOrderByCreatedAtDesc(User recipient, Pageable pageable);
    List<Notification> findByRecipientAndIsReadFalse(User recipient);
    Long countByRecipientAndIsReadFalse(User recipient);
}
