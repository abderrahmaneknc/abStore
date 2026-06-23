package com.abstorebackend.demo.services.impl;

import com.abstorebackend.demo.services.FileStorageService;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.Map;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    private Cloudinary cloudinary;

    @PostConstruct
    public void init() {

        cloudName = cloudName == null ? "" : cloudName.trim();
        apiKey = apiKey == null ? "" : apiKey.trim();
        apiSecret = apiSecret == null ? "" : apiSecret.trim();

        if (cloudName.isEmpty() || apiKey.isEmpty() || apiSecret.isEmpty()) {
            throw new IllegalStateException("Cloudinary config is missing in application.properties");
        }

        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true));

        System.out.println("✅ Cloudinary initialized successfully");
    }

    @Override
    public String saveImage(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            return null;
        }

        if (cloudinary == null) {
            throw new IllegalStateException("Cloudinary not initialized");
        }

        try {
            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "ab-store",
                            "resource_type", "image"));

            return (String) uploadResult.get("secure_url");

        } catch (IOException e) {
            throw new RuntimeException("Cloudinary upload failed", e);
        }
    }
}