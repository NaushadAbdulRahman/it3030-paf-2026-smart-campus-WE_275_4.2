package com.paf.backend.exception;

public class MaxAttachmentsException extends RuntimeException {
    public MaxAttachmentsException(String message, Throwable cause) {
        super(message, cause);
    }
    // ✅ ADD THIS
    public MaxAttachmentsException(String message) {
        super(message);
    }
}
