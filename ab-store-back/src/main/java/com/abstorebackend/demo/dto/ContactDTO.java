package com.abstorebackend.demo.dto;
import lombok.Data;
import java.time.LocalDateTime;
@Data
public class ContactDTO {
    private Long id;
    private String name;
    private String phoneOrEmail;
    private String message;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
