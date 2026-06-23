package com.abstorebackend.demo.entities;
import com.abstorebackend.demo.enums.ImageType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_images")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductImage {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 2048)
    private String url;
    
    @Enumerated(EnumType.STRING)
    private ImageType type;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;
}
