package com.paf.backend.security;

import com.paf.backend.model.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Helper to get the current authenticated user from the SecurityContext.
 * Replaces the old X-User-Email header approach.
 */
@Component
public class SecurityHelper {

    /**
     * Returns the current authenticated User entity, or null if not authenticated.
     */
    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof User)) {
            return null;
        }
        return (User) auth.getPrincipal();
    }

    /**
     * Returns the current authenticated user's email, or "anonymous".
     */
    public String getCurrentEmail() {
        User user = getCurrentUser();
        return user != null ? user.getEmail() : "anonymous";
    }
}
