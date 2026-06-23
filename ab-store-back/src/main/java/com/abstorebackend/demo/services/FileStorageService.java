package com.abstorebackend.demo.services;
import org.springframework.web.multipart.MultipartFile;
public interface FileStorageService {
    String saveImage(MultipartFile file);
}
