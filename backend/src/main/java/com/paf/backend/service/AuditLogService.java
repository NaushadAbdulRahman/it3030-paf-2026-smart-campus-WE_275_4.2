package com.paf.backend.service;

import org.springframework.stereotype.Service;

@Service
public class AuditLogService {

    public void logAction(String action, Long targetId, String username, String description) {
        System.out.println("AUDIT LOG: [" + action + "] by " + username + " on target " + targetId + " - " + description);
    }
}
