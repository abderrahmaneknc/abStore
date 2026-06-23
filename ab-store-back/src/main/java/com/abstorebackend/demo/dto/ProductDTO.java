package com.abstorebackend.demo.dto;
import com.abstorebackend.demo.enums.ProductStatus;
import lombok.Data;
import java.util.List;
@Data
public class ProductDTO {
    private Long id;
    private String name;
    private String brand;
    private String description;
    private Double price;
    private Integer stockQty;
    private ProductStatus productStatus;
    private Boolean isNew;
    private Boolean isPromotion;
    private Double discountPercent;
    private Double rating;
    private CategoryDTO category;
    private List<ProductImageDTO> images;
}
