package com.abstorebackend.demo.dto;
import com.abstorebackend.demo.enums.OrderStatus;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
@Data
public class OrderResponseDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String phone;
    private String email;
    private String wilaya;
    private String baladiya;
    private String fullAddress;
    private String postalCode;
    private String additionalNotes;
    private Double totalPrice;
    private OrderStatus status;
    private LocalDateTime createdAt;
    private List<OrderItemResponseDTO> items;
}
