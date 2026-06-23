package com.abstorebackend.demo.dto;
import com.abstorebackend.demo.enums.ImageType;
import lombok.Data;
@Data
public class ProductImageDTO {
    private Long id;
    private String url;
    private ImageType type;
}
