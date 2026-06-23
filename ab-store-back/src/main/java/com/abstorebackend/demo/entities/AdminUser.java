package com.abstorebackend.demo.entities;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "admin_users")
@Data @NoArgsConstructor @AllArgsConstructor
public class AdminUser {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(nullable = false)
    private String password;
}
