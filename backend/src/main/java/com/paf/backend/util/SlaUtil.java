package com.paf.backend.util;

import com.paf.backend.enums.TicketPriority;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class SlaUtil {

    /**
     * Calculates the SLA deadline based on priority.
     * CRITICAL = 2h, HIGH = 8h, MEDIUM = 24h, LOW = 72h
     */
    public LocalDateTime calculateDeadline(TicketPriority priority) {
        if (priority == null) {
            throw new IllegalArgumentException("Priority cannot be null");        }

        LocalDateTime now = LocalDateTime.now();

        return switch (priority) {
            case CRITICAL -> now.plusHours(2);
            case HIGH     -> now.plusHours(8);
            case MEDIUM   -> now.plusHours(24);
            case LOW      -> now.plusHours(72);
        };
    }

    /**
     * Checks if a deadline has passed.
     */
    public boolean isBreached(LocalDateTime deadline) {
        if (deadline == null) return false;
        return LocalDateTime.now().isAfter(deadline);
    }

    /**
     * Human-readable SLA label for the response.
     */
    public String getSlaLabel(TicketPriority priority) {
        return switch (priority) {
            case CRITICAL -> "2 hours";
            case HIGH     -> "8 hours";
            case MEDIUM   -> "24 hours";
            case LOW      -> "72 hours";
        };
    }
}