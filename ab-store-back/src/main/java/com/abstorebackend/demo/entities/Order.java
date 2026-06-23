package com.abstorebackend.demo.entities;
import com.abstorebackend.demo.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String firstName;
    private String lastName;
    private String phone;
    private String email;
    private String wilaya;
    private String baladiya;
    private String fullAddress;
    private String postalCode;
    
    @Column(columnDefinition = "TEXT")
    private String additionalNotes;
    
    @Column(nullable = false)
    private Double totalPrice;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;
    
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items;
    
    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); if(status == null) status = OrderStatus.PENDING; }
}
