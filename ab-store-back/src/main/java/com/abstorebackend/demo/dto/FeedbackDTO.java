package com.abstorebackend.demo.dto;
import lombok.Data;
import java.time.LocalDateTime;
@Data
public class FeedbackDTO {
    private Long id;
    private String name;
    private String message;
    private Integer rating;
    private Boolean visible;
    private LocalDateTime createdAt;
    private Long productId;
}
