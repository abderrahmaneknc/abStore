package com.abstorebackend.demo.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;

@Component
public class FileUploadValidator {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            ".jpg", ".jpeg", ".png", ".webp", ".gif"
    );

    @Value("${spring.servlet.multipart.max-file-size:10MB}")
    private String maxFileSizeProperty;

    public void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return;
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Unsupported file type. Allowed types: JPEG, PNG, WEBP, GIF.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new IllegalArgumentException("Uploaded file must have a valid filename.");
        }

        String lowerName = originalFilename.toLowerCase();
        boolean validExtension = ALLOWED_EXTENSIONS.stream().anyMatch(lowerName::endsWith);
        if (!validExtension) {
            throw new IllegalArgumentException("Unsupported file extension.");
        }

        if (file.getSize() > resolveMaxBytes()) {
            throw new IllegalArgumentException("File size exceeds the maximum allowed limit.");
        }
    }

    private long resolveMaxBytes() {
        String normalized = maxFileSizeProperty.trim().toUpperCase();
        if (normalized.endsWith("MB")) {
            return Long.parseLong(normalized.replace("MB", "").trim()) * 1024L * 1024L;
        }
        if (normalized.endsWith("KB")) {
            return Long.parseLong(normalized.replace("KB", "").trim()) * 1024L;
        }
        return Long.parseLong(normalized);
    }
}
