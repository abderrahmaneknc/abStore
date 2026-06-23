package com.abstorebackend.demo.dto;
import lombok.Data;
import java.util.List;
@Data
public class OrderRequestDTO {
    private String firstName;
    private String lastName;
    private String phone;
    private String email;
    private String wilaya;
    private String baladiya;
    private String fullAddress;
    private String postalCode;
    private String additionalNotes;
    private List<OrderItemRequestDTO> items;
}
