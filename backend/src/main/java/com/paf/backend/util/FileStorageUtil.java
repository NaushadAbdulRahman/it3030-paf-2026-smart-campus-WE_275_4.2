package com.paf.backend.util;

import com.paf.backend.exception.FileStorageException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Component
public class FileStorageUtil {

    private static final Logger log = LoggerFactory.getLogger(FileStorageUtil.class);

    @Value("${app.upload.dir:uploads/tickets}")
    private String uploadDir;

    private static final List<String> ALLOWED_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            ".jpg", ".jpeg", ".png", ".gif", ".webp"
    );

    /**
     * Validates and saves a file. Returns the relative path stored in DB.
     */
    public String store(MultipartFile file, String ticketId) {

        // Validate file type (MIME)
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new FileStorageException(
                    "Invalid file type. Only JPEG, PNG, GIF, and WEBP images are allowed.");
        }

        // Validate file is not empty
        if (file.isEmpty()) {
            throw new FileStorageException("Cannot upload an empty file.");
        }

        // Extract and validate file extension
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
        }

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new FileStorageException(
                    "Invalid file extension. Only .jpg, .jpeg, .png, .gif, and .webp files are allowed.");
        }

        // Sanitize ticketId - allow only alphanumeric characters
        String sanitizedTicketId = ticketId.replaceAll("[^a-zA-Z0-9]", "");
        if (sanitizedTicketId.isEmpty()) {
            throw new FileStorageException("Invalid ticket ID after sanitization.");
        }

        try {
            // Create ticket-specific directory
            Path ticketDir = Paths.get(uploadDir, sanitizedTicketId);
            Files.createDirectories(ticketDir);

            // Generate unique filename
            String storedFilename = UUID.randomUUID().toString() + extension;

            // Copy file
            Path targetPath = ticketDir.resolve(storedFilename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            // Return relative path
            return sanitizedTicketId + "/" + storedFilename;

        } catch (IOException ex) {
            log.error("File storage failed", ex);
            throw new FileStorageException("Failed to store file", ex);
        }
    }

    /**
     * Returns the full Path for a stored file given its relative DB path.
     */
    public Path load(String relativePath) {
        return Paths.get(uploadDir).resolve(relativePath);
    }

    /**
     * Deletes a stored file from disk.
     */
    public void delete(String relativePath) {
        try {
            Path filePath = load(relativePath);
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            log.warn("Could not delete file: {}", relativePath);
        }
    }

    /**
     * Returns the original filename from stored path.
     */
    public String getOriginalName(String relativePath) {
        Path p = Paths.get(relativePath);
        return p.getFileName().toString();
    }
}