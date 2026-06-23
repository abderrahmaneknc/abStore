package com.abstorebackend.demo.dto;

import lombok.Data;

@Data
public class OrderItemResponseDTO {
    private Long id;
    private Integer quantity;
    private Double price;
    private Long productId;
    private String productName;
}
