package com.abstorebackend.demo.dto;
import lombok.Data;
@Data
public class CategoryDTO {
    private Long id;
    private String name;
    private String imageUrl;
    private Boolean visible;
}
