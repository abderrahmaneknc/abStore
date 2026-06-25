package com.abstorebackend.demo.dto;
import lombok.Data;
@Data
public class OrderItemRequestDTO {
    private Long productId;
    private Integer quantity;
    private String selectedOptions;
}
