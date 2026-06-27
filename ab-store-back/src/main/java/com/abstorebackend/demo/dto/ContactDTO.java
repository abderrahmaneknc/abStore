package com.abstorebackend.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ContactDTO {
    private Long id;

    @NotBlank(message = "Name is required")
    @Size(max = 100)
    private String name;

    @NotBlank(message = "Phone or email is required")
    @Size(max = 255)
    private String phoneOrEmail;

    @NotBlank(message = "Message is required")
    @Size(max = 2000)
    private String message;

    private Boolean isRead;
    private LocalDateTime createdAt;
}
