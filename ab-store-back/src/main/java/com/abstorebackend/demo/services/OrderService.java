package com.abstorebackend.demo.services;

import com.abstorebackend.demo.dto.OrderRequestDTO;
import com.abstorebackend.demo.dto.OrderResponseDTO;
import com.abstorebackend.demo.enums.OrderStatus;

import java.util.List;

public interface OrderService {
    OrderResponseDTO createOrder(OrderRequestDTO dto);
    OrderResponseDTO updateOrderStatus(Long id, OrderStatus status);
    List<OrderResponseDTO> getAllOrders();
    OrderResponseDTO getOrderById(Long id);
    void deleteOrder(Long id);
}
