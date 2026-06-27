package com.abstorebackend.demo.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class OrderRequestDTO {
    @NotBlank(message = "First name is required")
    @Size(max = 100)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100)
    private String lastName;

    @NotBlank(message = "Phone is required")
    @Size(max = 30)
    private String phone;

    @Size(max = 255)
    private String email;

    @NotBlank(message = "Wilaya is required")
    @Size(max = 100)
    private String wilaya;

    @NotBlank(message = "Baladiya is required")
    @Size(max = 100)
    private String baladiya;

    @NotBlank(message = "Address is required")
    @Size(max = 500)
    private String fullAddress;

    @Size(max = 20)
    private String postalCode;

    @Size(max = 1000)
    private String additionalNotes;

    @NotEmpty(message = "Order must contain at least one item")
    @Valid
    private List<OrderItemRequestDTO> items;
}
