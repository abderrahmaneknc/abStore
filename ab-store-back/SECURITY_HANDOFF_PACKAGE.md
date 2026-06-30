# SECURITY HANDOFF PACKAGE

**Generated:** 2026-06-30  
**Project:** ab-store Spring Boot Backend  
**Purpose:** Comprehensive security review package for external auditor

---

## CONTEXT

This is a Spring Boot + React/Vite e-commerce backend. Important context the reviewer needs to know:

- There is only **ONE user** in this system: a single admin account
- There are **NO customer accounts, NO customer tokens**
- The admin JWT is intentionally stored in **localStorage** (not HttpOnly cookie) — this was a deliberate decision because there is only one trusted user, not a security oversight
- A previous security audit was already done and the following fixes were already applied:
  - Broken access control
  - Hardcoded JWT secret
  - Hardcoded Cloudinary secrets
  - Default admin credentials
  - Order PII exposure (IDOR)
  - Password change without current password check
  - Rate limiting
  - CORS configuration
  - Unauthenticated file uploads
  - Input validation
  - Error message leakage
  - Stock race condition
  - Actuator over-exposure
- A rate limit rule for `PUT /api/auth/password` was just added

---

## PROJECT STRUCTURE

```
ab-store-back/
├── .gitattributes
├── .gitignore
├── HELP.md
├── mvnw
├── mvnw.cmd
├── pom.xml
├── .mvn/
│   └── wrapper/
├── .vscode/
└── src/
    ├── main/
    │   ├── java/com/abstorebackend/demo/
    │   │   ├── DemoApplication.java
    │   │   ├── SchemaFixRunner.java
    │   │   ├── config/
    │   │   │   └── DataSeeder.java
    │   │   ├── controllers/
    │   │   │   ├── AuthController.java
    │   │   │   ├── CategoryController.java
    │   │   │   ├── ContactController.java
    │   │   │   ├── FeedbackController.java
    │   │   │   ├── OrderController.java
    │   │   │   └── ProductController.java
    │   │   ├── dto/
    │   │   │   ├── AuthRequest.java
    │   │   │   ├── AuthResponse.java
    │   │   │   ├── CategoryDTO.java
    │   │   │   ├── ContactDTO.java
    │   │   │   ├── FeedbackDTO.java
    │   │   │   ├── OrderItemRequestDTO.java
    │   │   │   ├── OrderItemResponseDTO.java
    │   │   │   ├── OrderRequestDTO.java
    │   │   │   ├── OrderResponseDTO.java
    │   │   │   ├── PasswordChangeRequest.java
    │   │   │   ├── PasswordResetRequest.java
    │   │   │   ├── ProductDTO.java
    │   │   │   └── ProductImageDTO.java
    │   │   ├── entities/
    │   │   │   ├── AdminUser.java
    │   │   │   ├── Category.java
    │   │   │   ├── Contact.java
    │   │   │   ├── Feedback.java
    │   │   │   ├── Order.java
    │   │   │   ├── OrderItem.java
    │   │   │   ├── Product.java
    │   │   │   └── ProductImage.java
    │   │   ├── enums/
    │   │   │   ├── ImageType.java
    │   │   │   ├── OrderStatus.java
    │   │   │   └── ProductStatus.java
    │   │   ├── exceptions/
    │   │   │   ├── BadRequestException.java
    │   │   │   ├── GlobalExceptionHandler.java
    │   │   │   └── ResourceNotFoundException.java
    │   │   ├── repositories/
    │   │   │   ├── AdminUserRepository.java
    │   │   │   ├── CategoryRepository.java
    │   │   │   ├── ContactRepository.java
    │   │   │   ├── FeedbackRepository.java
    │   │   │   ├── OrderRepository.java
    │   │   │   └── ProductRepository.java
    │   │   ├── security/
    │   │   │   ├── CustomUserDetails.java
    │   │   │   ├── CustomUserDetailsService.java
    │   │   │   ├── FileUploadValidator.java
    │   │   │   ├── JwtAuthenticationFilter.java
    │   │   │   ├── JwtService.java
    │   │   │   ├── RateLimitFilter.java
    │   │   │   └── SecurityConfig.java
    │   │   ├── services/
    │   │   │   ├── CategoryService.java
    │   │   │   ├── ContactService.java
    │   │   │   ├── FeedbackService.java
    │   │   │   ├── FileStorageService.java
    │   │   │   ├── OrderService.java
    │   │   │   ├── ProductService.java
    │   │   │   └── impl/
    │   │   │       ├── CategoryServiceImpl.java
    │   │   │       ├── ContactServiceImpl.java
    │   │   │       ├── FeedbackServiceImpl.java
    │   │   │       ├── FileStorageServiceImpl.java
    │   │   │       ├── OrderServiceImpl.java
    │   │   │       └── ProductServiceImpl.java
    │   │   └── specifications/
    │   │       └── ProductSpecification.java
    │   └── resources/
    │       ├── application.properties
    │       ├── application-prod.properties
    │       ├── static/
    │       └── templates/
    └── test/
        ├── java/com/abstorebackend/demo/
        │   ├── DemoApplicationTests.java
        │   └── controllers/
        │       └── AuthControllerTest.java
        └── resources/
            └── application.properties
```

---

## HARDCODED SECRETS SCAN RESULTS

All scans performed with PowerShell `Select-String` on `*.java` files, excluding the `target/` directory.

### SCAN 1: `password\s*=\s*["']` in `.java` files
```
No matches found
```

### SCAN 2: `secret\s*=\s*["']` in `.java` files
```
No matches found
```

### SCAN 3: `api[_-]key\s*=\s*["']` in `.java` files
```
No matches found
```

### SCAN 4: Strings of 32+ alphanumeric characters in quotes in `.java` files
```
No matches found
```

### SCAN 5: `cloudinary://` across all files
```
No matches found
```

### SCAN 6: `jdbc:postgresql://` in `.java` files
```
No matches found
```

### ADDITIONAL: Dev-default fallback values in `application.properties`
The following lines in `src/main/resources/application.properties` contain **dev-only fallback values** (used when env vars are absent). These are NOT hardcoded secrets — they are Spring property placeholders with `${VAR:default}` syntax — but are noted here for completeness:

```
Line 4:  app.jwt.secret=${JWT_SECRET:dev-only-change-me-use-at-least-32-characters-long-secret-key}
Line 9:  app.cors.allowed-origins=${CORS_ALLOWED_ORIGINS:http://localhost:5173,http://localhost:3000}
Line 11: spring.datasource.url=${DATABASE_URL:jdbc:postgresql://localhost:5432/abstore}
Line 12: spring.datasource.username=${DB_USERNAME:postgres}
Line 13: spring.datasource.password=${DB_PASSWORD:postgres}
```

**Note:** `application-prod.properties` uses `${VAR}` (no fallback) for all sensitive properties, so secrets are required from environment variables in production. The dev fallback JWT key (`dev-only-change-me-use-at-least-32-characters-long-secret-key`) is 64 characters long and would pass the minimum-length check in `JwtService.validateSecret()` if the env var is not set.

### ADDITIONAL: Test properties (non-production, test scope only)
`src/test/resources/application.properties` contains test-only placeholder values:
```
app.jwt.secret=test-jwt-secret-key-with-at-least-32-characters
app.admin-reset-key=test-reset-key
cloudinary.cloud-name=test-cloud
cloudinary.api-key=test-key
cloudinary.api-secret=test-secret
spring.datasource.url=jdbc:h2:mem:testdb;MODE=PostgreSQL;DB_CLOSE_DELAY=-1
spring.datasource.username=sa
spring.datasource.password=
```

---

## CONTROLLERS

### `AuthController.java`

```java
package com.abstorebackend.demo.controllers;

import com.abstorebackend.demo.dto.AuthRequest;
import com.abstorebackend.demo.dto.AuthResponse;
import com.abstorebackend.demo.dto.PasswordChangeRequest;
import com.abstorebackend.demo.dto.PasswordResetRequest;
import com.abstorebackend.demo.entities.AdminUser;
import com.abstorebackend.demo.exceptions.BadRequestException;
import com.abstorebackend.demo.exceptions.ResourceNotFoundException;
import com.abstorebackend.demo.repositories.AdminUserRepository;
import com.abstorebackend.demo.security.CustomUserDetails;
import com.abstorebackend.demo.security.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

        private final AuthenticationManager authenticationManager;
        private final JwtService jwtService;
        private final AdminUserRepository adminUserRepository;
        private final PasswordEncoder passwordEncoder;

        @Value("${app.admin-reset-key:}")
        private String adminResetKey;

        @PostMapping("/login")
        public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
                CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
                String token = jwtService.generateToken(userDetails);
                return ResponseEntity.ok(new AuthResponse(token));
        }

        @PutMapping("/password")
        public ResponseEntity<?> changePassword(@Valid @RequestBody PasswordChangeRequest request) {

                System.out.println("========== CHANGE PASSWORD ==========");

                try {
                        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

                        System.out.println("Authentication object: " + authentication);

                        if (authentication == null) {
                                System.out.println("Authentication is NULL");
                                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                                .body(Map.of("error", "Not authenticated"));
                        }

                        System.out.println("Authenticated: " + authentication.isAuthenticated());
                        System.out.println("Principal: " + authentication.getPrincipal());
                        System.out.println("Username: " + authentication.getName());

                        String username = authentication.getName();

                        AdminUser adminUser = adminUserRepository.findByUsername(username).orElse(null);

                        if (adminUser == null) {
                                System.out.println("Admin user not found in database");
                                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                                .body(Map.of("error", "Authenticated user not found"));
                        }

                        System.out.println("Admin found: " + adminUser.getUsername());

                        boolean currentPasswordMatches = passwordEncoder.matches(request.getCurrentPassword(),
                                        adminUser.getPassword());

                        System.out.println("Current password matches: " + currentPasswordMatches);

                        if (!currentPasswordMatches) {
                                return ResponseEntity.badRequest()
                                                .body(Map.of("error", "Current password is incorrect"));
                        }

                        boolean samePassword = passwordEncoder.matches(request.getNewPassword(),
                                        adminUser.getPassword());

                        System.out.println("New password equals old: " + samePassword);

                        if (samePassword) {
                                return ResponseEntity.badRequest()
                                                .body(Map.of("error",
                                                                "New password must be different from the current password"));
                        }

                        adminUser.setPassword(passwordEncoder.encode(request.getNewPassword()));

                        adminUserRepository.saveAndFlush(adminUser);

                        System.out.println("Password updated successfully.");

                        return ResponseEntity.ok(
                                        Map.of("message", "Password changed successfully"));

                } catch (Exception e) {

                        System.out.println("===== EXCEPTION =====");
                        e.printStackTrace();

                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body(Map.of(
                                                        "error", "Internal server error",
                                                        "exception", e.getClass().getSimpleName(),
                                                        "message", e.getMessage()));
                }
        }

        @PostMapping("/forgot-password")
        public ResponseEntity<?> forgotPassword(
                        @RequestHeader(value = "X-Admin-Reset-Key", required = false) String resetKey,
                        @Valid @RequestBody PasswordResetRequest request) {

                String configuredResetKey = adminResetKey == null
                                ? ""
                                : adminResetKey.trim().replace("\"", "");

                if (configuredResetKey.isBlank()) {
                        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                                        .body(Map.of("error", "Service temporarily unavailable"));// reset key is
                                                                                                  // invalid or not
                                                                                                  // configured
                }

                if (resetKey == null
                                || resetKey.trim().isBlank()
                                || !MessageDigest.isEqual(
                                                resetKey.trim().getBytes(StandardCharsets.UTF_8),
                                                configuredResetKey.getBytes(StandardCharsets.UTF_8))) {

                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                        .body(Map.of("error", "Request denied"));
                }

                AdminUser adminUser = adminUserRepository
                                .findByUsername(request.getUsername().trim())
                                .orElse(null);

                if (adminUser == null) {
                        return ResponseEntity.ok(
                                        Map.of("message", "If the request is valid, it has been processed."));
                }

                if (passwordEncoder.matches(request.getNewPassword(), adminUser.getPassword())) {
                        throw new BadRequestException(
                                        "New password must be different from the current password");
                }

                adminUser.setPassword(passwordEncoder.encode(request.getNewPassword()));
                adminUserRepository.saveAndFlush(adminUser);

                return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
        }
}
```

---

### `CategoryController.java`

```java
package com.abstorebackend.demo.controllers;

import com.abstorebackend.demo.dto.CategoryDTO;
import com.abstorebackend.demo.services.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryDTO>> getVisibleCategories() {
        return ResponseEntity.ok(categoryService.getVisibleCategories());
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @PostMapping(consumes = "multipart/form-data")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryDTO> createCategory(
            @RequestParam("name") String name,
            @RequestParam(value = "visible", defaultValue = "true") Boolean visible,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        return ResponseEntity.ok(categoryService.createCategory(name, visible, image));
    }

    @PutMapping(path = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryDTO> updateCategory(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam(value = "visible", defaultValue = "true") Boolean visible,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        return ResponseEntity.ok(categoryService.updateCategory(id, name, visible, image));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }
}
```

---

### `ContactController.java`

```java
package com.abstorebackend.demo.controllers;

import com.abstorebackend.demo.dto.ContactDTO;
import com.abstorebackend.demo.services.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    @PostMapping
    public ResponseEntity<ContactDTO> submitContact(@Valid @RequestBody ContactDTO dto) {
        return ResponseEntity.ok(contactService.submitContact(dto));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ContactDTO>> getAllContacts() {
        return ResponseEntity.ok(contactService.getAllContacts());
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ContactDTO> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(contactService.markAsRead(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteContact(@PathVariable Long id) {
        contactService.deleteContact(id);
        return ResponseEntity.ok().build();
    }
}
```

---

### `FeedbackController.java`

```java
package com.abstorebackend.demo.controllers;

import com.abstorebackend.demo.dto.FeedbackDTO;
import com.abstorebackend.demo.services.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping
    public ResponseEntity<FeedbackDTO> submitFeedback(@Valid @RequestBody FeedbackDTO feedbackDTO) {
        return ResponseEntity.ok(feedbackService.submitFeedback(feedbackDTO));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<FeedbackDTO>> getProductFeedbacks(@PathVariable Long productId) {
        return ResponseEntity.ok(feedbackService.getVisibleFeedbacksForProduct(productId));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FeedbackDTO>> getAllFeedbacks() {
        return ResponseEntity.ok(feedbackService.getAllFeedbacks());
    }

    @PutMapping("/{id}/visibility")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FeedbackDTO> toggleVisibility(@PathVariable Long id, @RequestParam boolean visible) {
        return ResponseEntity.ok(feedbackService.toggleVisibility(id, visible));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFeedback(@PathVariable Long id) {
        feedbackService.deleteFeedback(id);
        return ResponseEntity.ok().build();
    }
}
```

---

### `OrderController.java`

```java
package com.abstorebackend.demo.controllers;

import com.abstorebackend.demo.dto.OrderRequestDTO;
import com.abstorebackend.demo.dto.OrderResponseDTO;
import com.abstorebackend.demo.enums.OrderStatus;
import com.abstorebackend.demo.services.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponseDTO> createOrder(@Valid @RequestBody OrderRequestDTO requestDTO) {
        return ResponseEntity.ok(orderService.createOrder(requestDTO));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderResponseDTO>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderResponseDTO> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderResponseDTO> updateOrderStatus(@PathVariable Long id, @RequestParam OrderStatus status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.ok().build();
    }
}
```

---

### `ProductController.java`

```java
package com.abstorebackend.demo.controllers;

import com.abstorebackend.demo.dto.ProductDTO;
import com.abstorebackend.demo.enums.ProductStatus;
import com.abstorebackend.demo.services.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;

    @GetMapping
    public ResponseEntity<Page<ProductDTO>> searchProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) ProductStatus productStatus,
            @RequestParam(required = false) Boolean isNew,
            @RequestParam(required = false) Boolean isPromotion,
            Pageable pageable) {
        return ResponseEntity.ok(productService.searchProducts(
                search, categoryId, minPrice, maxPrice, brand, productStatus, isNew, isPromotion, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDTO> createProduct(
            @RequestPart("product") ProductDTO productDTO,
            @RequestPart(value = "frontImage", required = false) MultipartFile frontImage,
            @RequestPart(value = "backImage", required = false) MultipartFile backImage,
            @RequestPart(value = "galleryImages", required = false) List<MultipartFile> galleryImages) {
        return ResponseEntity.ok(productService.createProduct(productDTO, frontImage, backImage, galleryImages));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDTO> updateProduct(
            @PathVariable Long id,
            @RequestPart("product") ProductDTO productDTO,
            @RequestPart(value = "frontImage", required = false) MultipartFile frontImage,
            @RequestPart(value = "backImage", required = false) MultipartFile backImage,
            @RequestPart(value = "galleryImages", required = false) List<MultipartFile> galleryImages) {
        return ResponseEntity.ok(productService.updateProduct(id, productDTO, frontImage, backImage, galleryImages));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok().build();
    }
}
```

---

## ENTITIES

### `AdminUser.java`

```java
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
```

---

### `Category.java`

```java
package com.abstorebackend.demo.entities;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "categories")
@Data @NoArgsConstructor @AllArgsConstructor
public class Category {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(length = 2048)
    private String imageUrl;
    
    @Column(nullable = false)
    private Boolean visible = true;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Product> products;
    
    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = createdAt; }
    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
```

---

### `Contact.java`

```java
package com.abstorebackend.demo.entities;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "contacts")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Contact {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String phoneOrEmail;
    
    @Column(columnDefinition = "TEXT")
    private String message;
    
    private Boolean isRead = false;
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }
}
```

---

### `Feedback.java`

```java
package com.abstorebackend.demo.entities;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "feedbacks")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Feedback {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String message;
    
    @Column(nullable = false)
    private Integer rating;
    
    @Column(nullable = false)
    private Boolean visible = false;
    
    private LocalDateTime createdAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;
    
    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }
}
```

---

### `Order.java`

```java
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
```

---

### `OrderItem.java`

```java
package com.abstorebackend.demo.entities;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "order_items")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Integer quantity;
    
    @Column(nullable = false)
    private Double price;

    @Column(columnDefinition = "TEXT")
    private String selectedOptions;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;
}
```

---

### `Product.java`

```java
package com.abstorebackend.demo.entities;
import com.abstorebackend.demo.enums.ProductStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "products")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    private String brand;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private Double price;
    
    @Column(nullable = false)
    private Integer stockQty;
    
    @Enumerated(EnumType.STRING)
    private ProductStatus productStatus;
    
    private Boolean isNew;
    private Boolean isPromotion;
    private Double discountPercent;
    
    @Builder.Default
    private Double rating = 0.0;

    @Column(columnDefinition = "TEXT")
    private String options;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;
    
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductImage> images;
    
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Feedback> feedbacks;
    
    @OneToMany(mappedBy = "product")
    private List<OrderItem> orderItems;
    
    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = createdAt; }
    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
```

---

### `ProductImage.java`

```java
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
```

---

## SERVICES

### `CategoryService.java` (interface)

```java
package com.abstorebackend.demo.services;
import com.abstorebackend.demo.dto.CategoryDTO;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface CategoryService {
    List<CategoryDTO> getAllCategories();
    List<CategoryDTO> getVisibleCategories();
    CategoryDTO createCategory(String name, Boolean visible, MultipartFile image);
    CategoryDTO updateCategory(Long id, String name, Boolean visible, MultipartFile image);
    void deleteCategory(Long id);
}
```

---

### `ContactService.java` (interface)

```java
package com.abstorebackend.demo.services;
import com.abstorebackend.demo.dto.ContactDTO;
import java.util.List;

public interface ContactService {
    ContactDTO submitContact(ContactDTO dto);
    List<ContactDTO> getAllContacts();
    ContactDTO markAsRead(Long id);
    void deleteContact(Long id);
}
```

---

### `FeedbackService.java` (interface)

```java
package com.abstorebackend.demo.services;

import com.abstorebackend.demo.dto.FeedbackDTO;
import java.util.List;

public interface FeedbackService {
    FeedbackDTO submitFeedback(FeedbackDTO dto);
    List<FeedbackDTO> getVisibleFeedbacksForProduct(Long productId);
    List<FeedbackDTO> getAllFeedbacks();
    FeedbackDTO toggleVisibility(Long id, boolean visible);
    void deleteFeedback(Long id);
}
```

---

### `FileStorageService.java` (interface)

```java
package com.abstorebackend.demo.services;
import org.springframework.web.multipart.MultipartFile;
public interface FileStorageService {
    String saveImage(MultipartFile file);
}
```

---

### `OrderService.java` (interface)

```java
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
```

---

### `ProductService.java` (interface)

```java
package com.abstorebackend.demo.services;

import com.abstorebackend.demo.dto.ProductDTO;
import com.abstorebackend.demo.enums.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface ProductService {
    Page<ProductDTO> searchProducts(String search, Long categoryId, Double minPrice, Double maxPrice,
                                    String brand, ProductStatus productStatus, Boolean isNew, 
                                    Boolean isPromotion, Pageable pageable);
    ProductDTO getProductById(Long id);
    
    ProductDTO createProduct(ProductDTO productDTO, MultipartFile frontImage, MultipartFile backImage, java.util.List<MultipartFile> galleryImages);
    ProductDTO updateProduct(Long id, ProductDTO productDTO, MultipartFile frontImage, MultipartFile backImage, java.util.List<MultipartFile> galleryImages);
    void deleteProduct(Long id);
}
```

---

### `CategoryServiceImpl.java`

```java
package com.abstorebackend.demo.services.impl;
import com.abstorebackend.demo.dto.CategoryDTO;
import com.abstorebackend.demo.entities.Category;
import com.abstorebackend.demo.exceptions.ResourceNotFoundException;
import com.abstorebackend.demo.repositories.CategoryRepository;
import com.abstorebackend.demo.services.CategoryService;
import com.abstorebackend.demo.services.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository categoryRepository;
    private final FileStorageService fileStorageService;

    private CategoryDTO mapToDTO(Category cat) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(cat.getId());
        dto.setName(cat.getName());
        dto.setImageUrl(cat.getImageUrl());
        dto.setVisible(cat.getVisible());
        return dto;
    }

    @Override
    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public List<CategoryDTO> getVisibleCategories() {
        return categoryRepository.findByVisibleTrue().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public CategoryDTO createCategory(String name, Boolean visible, MultipartFile image) {
        String imageUrl = (image != null && !image.isEmpty()) ? fileStorageService.saveImage(image) : null;
        Category category = new Category();
        category.setName(name);
        category.setVisible(visible != null ? visible : true);
        category.setImageUrl(imageUrl);
        return mapToDTO(categoryRepository.save(category));
    }

    @Override
    public CategoryDTO updateCategory(Long id, String name, Boolean visible, MultipartFile image) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        category.setName(name);
        category.setVisible(visible != null ? visible : category.getVisible());
        if (image != null && !image.isEmpty()) {
            category.setImageUrl(fileStorageService.saveImage(image));
        }
        return mapToDTO(categoryRepository.save(category));
    }

    @Override
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }
}
```

---

### `ContactServiceImpl.java`

```java
package com.abstorebackend.demo.services.impl;

import com.abstorebackend.demo.dto.ContactDTO;
import com.abstorebackend.demo.entities.Contact;
import com.abstorebackend.demo.exceptions.ResourceNotFoundException;
import com.abstorebackend.demo.repositories.ContactRepository;
import com.abstorebackend.demo.services.ContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContactServiceImpl implements ContactService {

    private final ContactRepository contactRepository;

    private ContactDTO mapToDTO(Contact contact) {
        ContactDTO dto = new ContactDTO();
        dto.setId(contact.getId());
        dto.setName(contact.getName());
        dto.setPhoneOrEmail(contact.getPhoneOrEmail());
        dto.setMessage(contact.getMessage());
        dto.setIsRead(contact.getIsRead());
        dto.setCreatedAt(contact.getCreatedAt());
        return dto;
    }

    @Override
    public ContactDTO submitContact(ContactDTO dto) {
        Contact contact = new Contact();
        contact.setName(dto.getName());
        contact.setPhoneOrEmail(dto.getPhoneOrEmail());
        contact.setMessage(dto.getMessage());
        contact.setIsRead(false);
        return mapToDTO(contactRepository.save(contact));
    }

    @Override
    public List<ContactDTO> getAllContacts() {
        return contactRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ContactDTO markAsRead(Long id) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));
        contact.setIsRead(true);
        return mapToDTO(contactRepository.save(contact));
    }

    @Override
    public void deleteContact(Long id) {
        contactRepository.deleteById(id);
    }
}
```

---

### `FeedbackServiceImpl.java`

```java
package com.abstorebackend.demo.services.impl;

import com.abstorebackend.demo.dto.FeedbackDTO;
import com.abstorebackend.demo.entities.Feedback;
import com.abstorebackend.demo.entities.Product;
import com.abstorebackend.demo.exceptions.ResourceNotFoundException;
import com.abstorebackend.demo.repositories.FeedbackRepository;
import com.abstorebackend.demo.repositories.ProductRepository;
import com.abstorebackend.demo.services.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final ProductRepository productRepository;

    private FeedbackDTO mapToDTO(Feedback feedback) {
        FeedbackDTO dto = new FeedbackDTO();
        dto.setId(feedback.getId());
        dto.setName(feedback.getName());
        dto.setMessage(feedback.getMessage());
        dto.setRating(feedback.getRating());
        dto.setVisible(feedback.getVisible());
        dto.setCreatedAt(feedback.getCreatedAt());
        if (feedback.getProduct() != null) {
            dto.setProductId(feedback.getProduct().getId());
        }
        return dto;
    }

    @Override
    @Transactional
    public FeedbackDTO submitFeedback(FeedbackDTO dto) {
        Feedback feedback = new Feedback();
        feedback.setName(dto.getName());
        feedback.setMessage(dto.getMessage());
        feedback.setRating(dto.getRating() != null ? dto.getRating() : 5);
        feedback.setVisible(true);

        if (dto.getProductId() != null) {
            Product product = productRepository.findById(dto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
            feedback.setProduct(product);
        }

        Feedback savedFeedback = feedbackRepository.save(feedback);

        if (savedFeedback.getProduct() != null) {
            updateProductRating(savedFeedback.getProduct());
        }

        return mapToDTO(savedFeedback);
    }

    @Override
    public List<FeedbackDTO> getVisibleFeedbacksForProduct(Long productId) {
        return feedbackRepository.findByProductIdAndVisibleTrue(productId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<FeedbackDTO> getAllFeedbacks() {
        return feedbackRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FeedbackDTO toggleVisibility(Long id, boolean visible) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found"));
        feedback.setVisible(visible);
        Feedback saved = feedbackRepository.save(feedback);

        if (saved.getProduct() != null) {
            updateProductRating(saved.getProduct());
        }

        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public void deleteFeedback(Long id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found"));
        Product product = feedback.getProduct();
        feedbackRepository.deleteById(id);
        
        if (product != null) {
            updateProductRating(product);
        }
    }

    private void updateProductRating(Product product) {
        List<Feedback> visibleFeedbacks = feedbackRepository.findByProductIdAndVisibleTrue(product.getId());
        if (visibleFeedbacks.isEmpty()) {
            product.setRating(0.0);
        } else {
            double avg = visibleFeedbacks.stream()
                    .mapToInt(Feedback::getRating)
                    .average()
                    .orElse(0.0);
            product.setRating(Math.round(avg * 10.0) / 10.0); // 1 decimal place
        }
        productRepository.save(product);
    }
}
```

---

### `FileStorageServiceImpl.java`

```java
package com.abstorebackend.demo.services.impl;

import com.abstorebackend.demo.security.FileUploadValidator;
import com.abstorebackend.demo.services.FileStorageService;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.Map;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    private final FileUploadValidator fileUploadValidator;
    private Cloudinary cloudinary;

    public FileStorageServiceImpl(FileUploadValidator fileUploadValidator) {
        this.fileUploadValidator = fileUploadValidator;
    }

    @PostConstruct
    public void init() {
        cloudName = cloudName == null ? "" : cloudName.trim();
        apiKey = apiKey == null ? "" : apiKey.trim();
        apiSecret = apiSecret == null ? "" : apiSecret.trim();

        if (cloudName.isEmpty() || apiKey.isEmpty() || apiSecret.isEmpty()) {
            throw new IllegalStateException("Cloudinary config is missing. Set CLOUDINARY_* environment variables.");
        }

        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true));
    }

    @Override
    public String saveImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        fileUploadValidator.validateImage(file);

        if (cloudinary == null) {
            throw new IllegalStateException("Cloudinary not initialized");
        }

        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "ab-store",
                            "resource_type", "image"));

            return (String) uploadResult.get("secure_url");

        } catch (IOException e) {
            throw new IllegalStateException("Image upload failed");
        }
    }
}
```

---

### `OrderServiceImpl.java`

```java
package com.abstorebackend.demo.services.impl;

import com.abstorebackend.demo.dto.OrderItemRequestDTO;
import com.abstorebackend.demo.dto.OrderRequestDTO;
import com.abstorebackend.demo.dto.OrderResponseDTO;
import com.abstorebackend.demo.entities.Order;
import com.abstorebackend.demo.entities.OrderItem;
import com.abstorebackend.demo.entities.Product;
import com.abstorebackend.demo.enums.OrderStatus;
import com.abstorebackend.demo.exceptions.BadRequestException;
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
                itemDto.setSelectedOptions(item.getSelectedOptions());
                return itemDto;
            }).collect(Collectors.toList()));
        }
        return dto;
    }

    @Override
    @Transactional
    public OrderResponseDTO createOrder(OrderRequestDTO dto) {
        if (dto.getItems() == null || dto.getItems().isEmpty()) {
            throw new BadRequestException("Order must contain at least one item");
        }

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
            Product product = productRepository.findByIdForUpdate(itemDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id " + itemDto.getProductId()));

            if (product.getStockQty() < itemDto.getQuantity()) {
                throw new IllegalStateException("Insufficient stock for product: " + product.getName());
            }

            product.setStockQty(product.getStockQty() - itemDto.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemDto.getQuantity());
            orderItem.setSelectedOptions(itemDto.getSelectedOptions());
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

        if (status == OrderStatus.CANCELED && previousStatus != OrderStatus.CANCELED) {
            if (order.getItems() != null) {
                for (OrderItem item : order.getItems()) {
                    if (item.getProduct() != null) {
                        Product product = productRepository.findByIdForUpdate(item.getProduct().getId())
                                .orElse(item.getProduct());
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
```

---

### `ProductServiceImpl.java`

```java
package com.abstorebackend.demo.services.impl;

import com.abstorebackend.demo.dto.CategoryDTO;
import com.abstorebackend.demo.dto.ProductDTO;
import com.abstorebackend.demo.dto.ProductImageDTO;
import com.abstorebackend.demo.entities.Category;
import com.abstorebackend.demo.entities.Product;
import com.abstorebackend.demo.entities.ProductImage;
import com.abstorebackend.demo.enums.ImageType;
import com.abstorebackend.demo.enums.ProductStatus;
import com.abstorebackend.demo.exceptions.ResourceNotFoundException;
import com.abstorebackend.demo.repositories.CategoryRepository;
import com.abstorebackend.demo.repositories.ProductRepository;
import com.abstorebackend.demo.services.FileStorageService;
import com.abstorebackend.demo.services.ProductService;
import com.abstorebackend.demo.specifications.ProductSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final FileStorageService fileStorageService;
    private final JdbcTemplate jdbcTemplate;

    private ProductDTO mapToDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setBrand(product.getBrand());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setStockQty(product.getStockQty());
        dto.setProductStatus(product.getProductStatus());
        dto.setIsNew(product.getIsNew());
        dto.setIsPromotion(product.getIsPromotion());
        dto.setDiscountPercent(product.getDiscountPercent());
        dto.setRating(product.getRating());
        dto.setOptions(product.getOptions());
        
        if (product.getCategory() != null) {
            CategoryDTO catDto = new CategoryDTO();
            catDto.setId(product.getCategory().getId());
            catDto.setName(product.getCategory().getName());
            dto.setCategory(catDto);
        }
        
        if (product.getImages() != null) {
            dto.setImages(product.getImages().stream().map(img -> {
                ProductImageDTO imgDto = new ProductImageDTO();
                imgDto.setId(img.getId());
                imgDto.setUrl(img.getUrl());
                imgDto.setType(img.getType());
                return imgDto;
            }).collect(Collectors.toList()));
        }
        return dto;
    }

    @Override
    public Page<ProductDTO> searchProducts(String search, Long categoryId, Double minPrice, Double maxPrice, String brand, ProductStatus productStatus, Boolean isNew, Boolean isPromotion, Pageable pageable) {
        return productRepository.findAll(ProductSpecification.filterProducts(
                search, categoryId, minPrice, maxPrice, brand, productStatus, isNew, isPromotion), pageable)
                .map(this::mapToDTO);
    }

    @Override
    public ProductDTO getProductById(Long id) {
        return productRepository.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    @Override
    @Transactional
    public ProductDTO createProduct(ProductDTO productDTO, MultipartFile frontImage, MultipartFile backImage, java.util.List<MultipartFile> galleryImages) {
        Category category = null;
        if (productDTO.getCategory() != null && productDTO.getCategory().getId() != null) {
            category = categoryRepository.findById(productDTO.getCategory().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        }

        Product product = new Product();
        product.setName(productDTO.getName());
        product.setBrand(productDTO.getBrand());
        product.setDescription(productDTO.getDescription());
        product.setPrice(productDTO.getPrice());
        product.setStockQty(productDTO.getStockQty());
        product.setProductStatus(productDTO.getProductStatus());
        product.setIsNew(productDTO.getIsNew() != null ? productDTO.getIsNew() : true);
        product.setIsPromotion(productDTO.getIsPromotion() != null ? productDTO.getIsPromotion() : false);
        product.setDiscountPercent(productDTO.getDiscountPercent() != null ? productDTO.getDiscountPercent() : 0.0);
        product.setRating(productDTO.getRating() != null ? productDTO.getRating() : 0.0);
        product.setCategory(category);
        product.setOptions(productDTO.getOptions());

        List<ProductImage> images = new ArrayList<>();
        if (frontImage != null && !frontImage.isEmpty()) {
            String frontUrl = fileStorageService.saveImage(frontImage);
            ProductImage pi = new ProductImage();
            pi.setUrl(frontUrl);
            pi.setType(ImageType.FRONT);
            pi.setProduct(product);
            images.add(pi);
        }
        if (backImage != null && !backImage.isEmpty()) {
            String backUrl = fileStorageService.saveImage(backImage);
            ProductImage pi = new ProductImage();
            pi.setUrl(backUrl);
            pi.setType(ImageType.BACK);
            pi.setProduct(product);
            images.add(pi);
        }
        if (galleryImages != null && !galleryImages.isEmpty()) {
            for (MultipartFile file : galleryImages) {
                if (file != null && !file.isEmpty()) {
                    String galleryUrl = fileStorageService.saveImage(file);
                    ProductImage pi = new ProductImage();
                    pi.setUrl(galleryUrl);
                    pi.setType(ImageType.GALLERY);
                    pi.setProduct(product);
                    images.add(pi);
                }
            }
        }
        product.setImages(images);

        return mapToDTO(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductDTO updateProduct(Long id, ProductDTO productDTO, MultipartFile frontImage, MultipartFile backImage, java.util.List<MultipartFile> galleryImages) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (productDTO.getCategory() != null && productDTO.getCategory().getId() != null) {
            Category category = categoryRepository.findById(productDTO.getCategory().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            product.setCategory(category);
        }

        product.setName(productDTO.getName());
        product.setBrand(productDTO.getBrand());
        product.setDescription(productDTO.getDescription());
        product.setPrice(productDTO.getPrice());
        product.setStockQty(productDTO.getStockQty());
        product.setProductStatus(productDTO.getProductStatus());
        product.setIsNew(productDTO.getIsNew() != null ? productDTO.getIsNew() : product.getIsNew());
        product.setIsPromotion(productDTO.getIsPromotion() != null ? productDTO.getIsPromotion() : product.getIsPromotion());
        product.setDiscountPercent(productDTO.getDiscountPercent() != null ? productDTO.getDiscountPercent() : 0.0);
        product.setRating(productDTO.getRating() != null ? productDTO.getRating() : product.getRating());
        product.setOptions(productDTO.getOptions() != null ? productDTO.getOptions() : product.getOptions());

        // Update images if provided
        if (frontImage != null && !frontImage.isEmpty()) {
            String frontUrl = fileStorageService.saveImage(frontImage);
            ProductImage existingFront = product.getImages().stream().filter(i -> i.getType() == ImageType.FRONT).findFirst().orElse(null);
            if (existingFront != null) {
                existingFront.setUrl(frontUrl);
            } else {
                ProductImage pi = new ProductImage();
                pi.setUrl(frontUrl);
                pi.setType(ImageType.FRONT);
                pi.setProduct(product);
                product.getImages().add(pi);
            }
        }

        if (backImage != null && !backImage.isEmpty()) {
            String backUrl = fileStorageService.saveImage(backImage);
            ProductImage existingBack = product.getImages().stream().filter(i -> i.getType() == ImageType.BACK).findFirst().orElse(null);
            if (existingBack != null) {
                existingBack.setUrl(backUrl);
            } else {
                ProductImage pi = new ProductImage();
                pi.setUrl(backUrl);
                pi.setType(ImageType.BACK);
                pi.setProduct(product);
                product.getImages().add(pi);
            }
        }

        if (galleryImages != null && !galleryImages.isEmpty()) {
            // Remove existing gallery images
            product.getImages().removeIf(img -> img.getType() == ImageType.GALLERY);
            // Add new ones
            for (MultipartFile file : galleryImages) {
                if (file != null && !file.isEmpty()) {
                    String galleryUrl = fileStorageService.saveImage(file);
                    ProductImage pi = new ProductImage();
                    pi.setUrl(galleryUrl);
                    pi.setType(ImageType.GALLERY);
                    pi.setProduct(product);
                    product.getImages().add(pi);
                }
            }
        }

        return mapToDTO(productRepository.save(product));
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        jdbcTemplate.update("UPDATE order_items SET product_id = NULL WHERE product_id = ?", id);
        productRepository.deleteById(id);
    }
}
```

---

## OTHER SECURITY-RELATED FILES NOT YET REVIEWED

The instructions exclude files already reviewed (AuthController, JwtAuthenticationFilter, JwtService, SecurityConfig, RateLimitFilter, FileUploadValidator). The following security-related files are included here as they were NOT in that exclusion list and contain security-relevant logic.

### `CustomUserDetails.java`

```java
package com.abstorebackend.demo.security;

import com.abstorebackend.demo.entities.AdminUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@RequiredArgsConstructor
public class CustomUserDetails implements UserDetails {

    private final AdminUser adminUser;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_ADMIN"));
    }

    @Override
    public String getPassword() {
        return adminUser.getPassword();
    }

    @Override
    public String getUsername() {
        return adminUser.getUsername();
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}
```

---

### `CustomUserDetailsService.java`

```java
package com.abstorebackend.demo.security;

import com.abstorebackend.demo.entities.AdminUser;
import com.abstorebackend.demo.repositories.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final AdminUserRepository adminUserRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        AdminUser admin = adminUserRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return new CustomUserDetails(admin);
    }
}
```

---

### `DataSeeder.java` (config — first-run admin seeding)

```java
package com.abstorebackend.demo.config;

import com.abstorebackend.demo.entities.AdminUser;
import com.abstorebackend.demo.repositories.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed-admin-username:admin}")
    private String seedAdminUsername;

    @Value("${app.seed-admin-password:}")
    private String seedAdminPassword;

    @Override
    public void run(String... args) {
        if (adminUserRepository.count() > 0) {
            return;
        }

        if (seedAdminPassword == null || seedAdminPassword.isBlank()) {
            log.warn("No admin user exists and app.seed-admin-password is not set. Admin seed skipped.");
            return;
        }

        AdminUser admin = new AdminUser();
        admin.setUsername(seedAdminUsername.trim());
        admin.setPassword(passwordEncoder.encode(seedAdminPassword.trim()));
        adminUserRepository.save(admin);
        log.info("Initial admin user '{}' created. Change the password immediately.", seedAdminUsername.trim());
    }
}
```

---

### `GlobalExceptionHandler.java` (exceptions — affects error leakage)

```java
package com.abstorebackend.demo.exceptions;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleNotFound(ResourceNotFoundException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler({IllegalStateException.class, IllegalArgumentException.class, BadRequestException.class})
    public ResponseEntity<?> handleBadRequest(RuntimeException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));
        Map<String, String> response = new HashMap<>();
        response.put("error", message.isBlank() ? "Validation failed" : message);
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<?> handleAuthentication(AuthenticationException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", "Invalid username or password");
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<?> handleBadCredentials(BadCredentialsException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", "Invalid username or password");
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<?> handleMaxUploadSize(MaxUploadSizeExceededException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", "File size exceeds the maximum allowed limit.");
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MissingServletRequestPartException.class)
    public ResponseEntity<?> handleMissingPart(MissingServletRequestPartException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", "Missing required request part.");
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGlobal(Exception ex) {
        log.error("Unhandled exception", ex);
        Map<String, String> response = new HashMap<>();
        response.put("error", "An unexpected error occurred. Please try again later.");
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
```

---

### `SchemaFixRunner.java` (startup DDL — raw SQL)

```java
package com.abstorebackend.demo;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class SchemaFixRunner implements CommandLineRunner {
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            jdbcTemplate.execute("ALTER TABLE product_images DROP CONSTRAINT IF EXISTS product_images_type_check");
            System.out.println("DROPPED CONSTRAINT product_images_type_check successfully. This fixes the GALLERY type insert bug.");
        } catch (Exception e) {
            System.err.println("Failed to drop constraint: " + e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE products ADD COLUMN IF NOT EXISTS options TEXT");
            jdbcTemplate.execute("ALTER TABLE order_items ADD COLUMN IF NOT EXISTS selected_options TEXT");
            System.out.println("Schema columns for product options verified.");
        } catch (Exception e) {
            System.err.println("Failed to add options columns: " + e.getMessage());
        }
    }
}
```

---

## DEPENDENCIES (pom.xml)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>4.1.0</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>
	<groupId>com.abstorebackend</groupId>
	<artifactId>demo</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<name>demo</name>
	<description/>
	<url/>
	<licenses>
		<license/>
	</licenses>
	<developers>
		<developer/>
	</developers>
	<scm>
		<connection/>
		<developerConnection/>
		<tag/>
		<url/>
	</scm>
	<properties>
		<java.version>17</java.version>
	</properties>
	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-actuator</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-data-jpa</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-security</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-validation</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-webmvc</artifactId>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-devtools</artifactId>
			<scope>runtime</scope>
			<optional>true</optional>
		</dependency>
		<dependency>
			<groupId>org.postgresql</groupId>
			<artifactId>postgresql</artifactId>
			<scope>runtime</scope>
		</dependency>
		<dependency>
			<groupId>com.h2database</groupId>
			<artifactId>h2</artifactId>
			<scope>test</scope>
		</dependency>
		<dependency>
			<groupId>org.projectlombok</groupId>
			<artifactId>lombok</artifactId>
			<optional>true</optional>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-actuator-test</artifactId>
			<scope>test</scope>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-data-jpa-test</artifactId>
			<scope>test</scope>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-security-test</artifactId>
			<scope>test</scope>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-validation-test</artifactId>
			<scope>test</scope>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-webmvc-test</artifactId>
			<scope>test</scope>
		</dependency>
		<!-- JWT -->
		<dependency>
			<groupId>io.jsonwebtoken</groupId>
			<artifactId>jjwt-api</artifactId>
			<version>0.11.5</version>
		</dependency>
		<dependency>
			<groupId>io.jsonwebtoken</groupId>
			<artifactId>jjwt-impl</artifactId>
			<version>0.11.5</version>
			<scope>runtime</scope>
		</dependency>
		<dependency>
			<groupId>io.jsonwebtoken</groupId>
			<artifactId>jjwt-jackson</artifactId>
			<version>0.11.5</version>
			<scope>runtime</scope>
		</dependency>
		<!-- Cloudinary for Image Uploads -->
		<dependency>
			<groupId>com.cloudinary</groupId>
			<artifactId>cloudinary-http44</artifactId>
			<version>1.36.0</version>
		</dependency>
	</dependencies>

	<build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
				<configuration>
					<excludes>
						<exclude>
							<groupId>org.projectlombok</groupId>
							<artifactId>lombok</artifactId>
						</exclude>
					</excludes>
				</configuration>
			</plugin>
			<plugin>
				<groupId>org.apache.maven.plugins</groupId>
				<artifactId>maven-compiler-plugin</artifactId>
				<executions>
					<execution>
						<id>default-compile</id>
						<phase>compile</phase>
						<goals>
							<goal>compile</goal>
						</goals>
						<configuration>
							<annotationProcessorPaths>
								<path>
									<groupId>org.projectlombok</groupId>
									<artifactId>lombok</artifactId>
								</path>
							</annotationProcessorPaths>
						</configuration>
					</execution>
					<execution>
						<id>default-testCompile</id>
						<phase>test-compile</phase>
						<goals>
							<goal>testCompile</goal>
						</goals>
						<configuration>
							<annotationProcessorPaths>
								<path>
									<groupId>org.projectlombok</groupId>
									<artifactId>lombok</artifactId>
								</path>
							</annotationProcessorPaths>
						</configuration>
					</execution>
				</executions>
			</plugin>
		</plugins>
	</build>

</project>
```

**Key dependency versions for reviewer:**
| Dependency | Version | Notes |
|---|---|---|
| Spring Boot Parent | 4.1.0 | Very recent (2025) |
| Java | 17 | LTS |
| jjwt-api / jjwt-impl / jjwt-jackson | 0.11.5 | Check for CVEs (latest is 0.12.x) |
| cloudinary-http44 | 1.36.0 | Check for CVEs |
| postgresql driver | managed by Spring Boot BOM | Version managed by parent |
| h2 (test only) | managed by Spring Boot BOM | Test scope only |
| lombok | managed by Spring Boot BOM | Compile-time only |

**Note:** `OWASP dependency-check` Maven plugin is **NOT present** in `pom.xml`. No automated vulnerability check is configured.

---

## .gitignore CONTENTS

```
HELP.md
target/
.mvn/wrapper/maven-wrapper.jar
!**/src/main/**/target/
!**/src/test/**/target/

### STS ###
.apt_generated
.classpath
.factorypath
.project
.settings
.springBeans
.sts4-cache 

### IntelliJ IDEA ###
.idea
*.iws
*.iml
*.ipr

### NetBeans ###
/nbproject/private/
/nbbuild/
/dist/
/nbdist/
/.nb-gradle/
build/
!**/src/main/**/build/
!**/src/test/**/build/

### VS Code ###
.vscode/
```

**Analysis — what is NOT in .gitignore:**

| File | In .gitignore? | Contains real secrets? | Risk |
|---|---|---|---|
| `src/main/resources/application.properties` | **NO** | Only env-var placeholders with dev defaults | MEDIUM — dev defaults for DB password (`postgres`) and JWT fallback key would be committed |
| `src/main/resources/application-prod.properties` | **NO** | No real values (all `${VAR}` with no fallback) | LOW — no real values |
| `src/test/resources/application.properties` | **NO** | Dummy/test values only | LOW — test-only values |
| `.env` files | N/A — none exist | N/A | None |
| `target/` | **YES** | N/A | Covered |

**Notable gap:** `src/main/resources/application.properties` is not in `.gitignore`. This means the dev-fallback JWT secret (`dev-only-change-me-use-at-least-32-characters-long-secret-key`) and default DB credentials (`postgres`/`postgres`) are committed to version control. If this repository is ever made public or the dev machine is compromised, those defaults would be visible. The production profile (`application-prod.properties`) contains no real values, so it is safe as committed.

---

## SECURITY-RELATED TODO/FIXME COMMENTS

```
No matches found
```

Scan performed against all `*.java` files in `src/` (excluding `target/`) searching for `TODO`, `FIXME`, or `HACK` patterns filtered by `security`, `auth`, `password`, `token`, or `secret`.

No security-related TODOs, FIXMEs, or HACKs exist in the codebase.

---

## SUPPLEMENTARY FILES (for completeness)

### `src/main/resources/application.properties`

```properties
spring.application.name=ab-store
server.port=8081

app.jwt.secret=${JWT_SECRET:dev-only-change-me-use-at-least-32-characters-long-secret-key}
app.jwt.expiration-hours=24
app.admin-reset-key=${ADMIN_RESET_KEY:}
app.seed-admin-username=${SEED_ADMIN_USERNAME:admin}
app.seed-admin-password=${SEED_ADMIN_PASSWORD:}
app.cors.allowed-origins=${CORS_ALLOWED_ORIGINS:http://localhost:5173,http://localhost:3000}

spring.datasource.url=${DATABASE_URL:jdbc:postgresql://localhost:5432/abstore}
spring.datasource.username=${DB_USERNAME:postgres}
spring.datasource.password=${DB_PASSWORD:postgres}

spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

cloudinary.cloud-name=${CLOUDINARY_CLOUD_NAME:}
cloudinary.api-key=${CLOUDINARY_API_KEY:}
cloudinary.api-secret=${CLOUDINARY_API_SECRET:}

spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

management.endpoints.web.exposure.include=health
management.endpoint.health.show-details=never

server.error.include-message=never
server.error.include-stacktrace=never
```

---

### `src/main/resources/application-prod.properties`

```properties
spring.application.name=ab-store
server.port=8080

app.jwt.secret=${JWT_SECRET}
app.jwt.expiration-hours=4
app.admin-reset-key=${ADMIN_RESET_KEY}
app.seed-admin-username=${SEED_ADMIN_USERNAME:admin}
app.seed-admin-password=${SEED_ADMIN_PASSWORD}
app.cors.allowed-origins=${CORS_ALLOWED_ORIGINS}

spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

spring.jpa.hibernate.ddl-auto=validate
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

cloudinary.cloud-name=${CLOUDINARY_CLOUD_NAME}
cloudinary.api-key=${CLOUDINARY_API_KEY}
cloudinary.api-secret=${CLOUDINARY_API_SECRET}

spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

management.endpoints.web.exposure.include=health
management.endpoint.health.show-details=never

server.error.include-message=never
server.error.include-stacktrace=never
```

---

### `src/test/resources/application.properties`

```properties
app.jwt.secret=test-jwt-secret-key-with-at-least-32-characters
app.admin-reset-key=test-reset-key
app.seed-admin-password=

cloudinary.cloud-name=test-cloud
cloudinary.api-key=test-key
cloudinary.api-secret=test-secret

spring.datasource.url=jdbc:h2:mem:testdb;MODE=PostgreSQL;DB_CLOSE_DELAY=-1
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.hibernate.ddl-auto=create-drop
```

---

### `src/test/java/.../AuthControllerTest.java`

```java
package com.abstorebackend.demo.controllers;

import com.abstorebackend.demo.dto.PasswordResetRequest;
import com.abstorebackend.demo.entities.AdminUser;
import com.abstorebackend.demo.repositories.AdminUserRepository;
import com.abstorebackend.demo.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @Mock
    private AdminUserRepository adminUserRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthController authController;

    @Test
    void forgotPasswordShouldAcceptResetKeyWhenConfiguredWithQuotes() {
        ReflectionTestUtils.setField(authController, "adminResetKey", "\"abdelbasetabstore\"");

        AdminUser adminUser = new AdminUser();
        adminUser.setUsername("admin");
        adminUser.setPassword("old-password");

        when(adminUserRepository.findByUsername("admin")).thenReturn(Optional.of(adminUser));
        when(passwordEncoder.encode("new-password")).thenReturn("encoded-password");
        when(adminUserRepository.saveAndFlush(any(AdminUser.class))).thenReturn(adminUser);

        ResponseEntity<?> response = authController.forgotPassword(
                "abdelbasetabstore",
                new PasswordResetRequest("admin", "new-password"));

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Password reset successfully", ((java.util.Map<?, ?>) response.getBody()).get("message"));
    }
}
```

**Note for reviewer:** The test uses a hardcoded reset key value `abdelbasetabstore` that appears to be a real project-specific name. This is in a test file only and is not a production secret, but the reviewer should be aware that this value was once used (or tested against) as the actual reset key.

---

*End of Security Handoff Package*
