package com.paf.backend.exception;

public class ResourceNotFoundException extends RuntimeException {

    // ✅ THIS FIXES YOUR CURRENT ERROR
    public ResourceNotFoundException(String message) {
        super(message);
    }

    // ✅ KEEP THIS (good for debugging)
    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}