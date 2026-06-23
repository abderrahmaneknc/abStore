package com.abstorebackend.demo.services.impl;

import com.abstorebackend.demo.dto.OrderItemRequestDTO;
import com.abstorebackend.demo.dto.OrderRequestDTO;
import com.abstorebackend.demo.dto.OrderResponseDTO;
import com.abstorebackend.demo.entities.Order;
import com.abstorebackend.demo.entities.OrderItem;
import com.abstorebackend.demo.entities.Product;
import com.abstorebackend.demo.enums.OrderStatus;
import com.abstorebackend.demo.exceptions.ResourceNotFoundException;
import com.abstorebackend.demo.repositories.OrderRepository;
import com.abstorebackend.demo.repositories.ProductRepository;
import com.abstorebackend.demo.services.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    private OrderResponseDTO mapToDTO(Order order) {
        OrderResponseDTO dto = new OrderResponseDTO();
        dto.setId(order.getId());
        dto.setFirstName(order.getFirstName());
        dto.setLastName(order.getLastName());
        dto.setPhone(order.getPhone());
        dto.setEmail(order.getEmail());
        dto.setWilaya(order.getWilaya());
        dto.setBaladiya(order.getBaladiya());
        dto.setFullAddress(order.getFullAddress());
        dto.setPostalCode(order.getPostalCode());
        dto.setAdditionalNotes(order.getAdditionalNotes());
        dto.setTotalPrice(order.getTotalPrice());
        dto.setStatus(order.getStatus());
        dto.setCreatedAt(order.getCreatedAt());

        if (order.getItems() != null) {
            dto.setItems(order.getItems().stream().map(item -> {
                com.abstorebackend.demo.dto.OrderItemResponseDTO itemDto = new com.abstorebackend.demo.dto.OrderItemResponseDTO();
                itemDto.setId(item.getId());
                itemDto.setQuantity(item.getQuantity());
                itemDto.setPrice(item.getPrice());
                if (item.getProduct() != null) {
                    itemDto.setProductId(item.getProduct().getId());
                    itemDto.setProductName(item.getProduct().getName());
                }
                return itemDto;
            }).collect(Collectors.toList()));
        }
        return dto;
    }

    @Override
    @Transactional
    public OrderResponseDTO createOrder(OrderRequestDTO dto) {
        Order order = new Order();
        order.setFirstName(dto.getFirstName());
        order.setLastName(dto.getLastName());
        order.setPhone(dto.getPhone());
        order.setEmail(dto.getEmail());
        order.setWilaya(dto.getWilaya());
        order.setBaladiya(dto.getBaladiya());
        order.setFullAddress(dto.getFullAddress());
        order.setPostalCode(dto.getPostalCode());
        order.setAdditionalNotes(dto.getAdditionalNotes());
        order.setStatus(OrderStatus.PENDING);

        double totalPrice = 0;
        List<OrderItem> orderItems = new ArrayList<>();

        for (OrderItemRequestDTO itemDto : dto.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id " + itemDto.getProductId()));
            
            if (product.getStockQty() < itemDto.getQuantity()) {
                throw new IllegalStateException("Insufficient stock for product: " + product.getName());
            }

            // Deduct stock
            product.setStockQty(product.getStockQty() - itemDto.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemDto.getQuantity());
            orderItem.setPrice(product.getPrice() * itemDto.getQuantity());

            totalPrice += orderItem.getPrice();
            orderItems.add(orderItem);
        }

        order.setItems(orderItems);
        order.setTotalPrice(totalPrice);

        return mapToDTO(orderRepository.save(order));
    }

    @Override
    @Transactional
    public OrderResponseDTO updateOrderStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        OrderStatus previousStatus = order.getStatus();

        // Restore stock when changing TO cancelled from a non-cancelled status
        if (status == OrderStatus.CANCELED && previousStatus != OrderStatus.CANCELED) {
            if (order.getItems() != null) {
                for (OrderItem item : order.getItems()) {
                    if (item.getProduct() != null) {
                        Product product = item.getProduct();
                        product.setStockQty(product.getStockQty() + item.getQuantity());
                        productRepository.save(product);
                    }
                }
            }
        }

        order.setStatus(status);
        return mapToDTO(orderRepository.save(order));
    }

    @Override
    public List<OrderResponseDTO> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public OrderResponseDTO getOrderById(Long id) {
        return orderRepository.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
    }

    @Override
    @Transactional
    public void deleteOrder(Long id) {
        if (!orderRepository.existsById(id)) {
            throw new ResourceNotFoundException("Order not found");
        }
        orderRepository.deleteById(id);
    }
}
