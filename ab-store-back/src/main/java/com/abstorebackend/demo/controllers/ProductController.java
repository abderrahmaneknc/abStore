package com.abstorebackend.demo.controllers;

import com.abstorebackend.demo.dto.ProductDTO;
import com.abstorebackend.demo.enums.ProductStatus;
import com.abstorebackend.demo.services.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;

    // Public
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

    // Public
    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    // Admin
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductDTO> createProduct(
            @RequestPart("product") ProductDTO productDTO,
            @RequestPart(value = "frontImage", required = false) MultipartFile frontImage,
            @RequestPart(value = "backImage", required = false) MultipartFile backImage,
            @RequestPart(value = "galleryImages", required = false) List<MultipartFile> galleryImages) {
        
        return ResponseEntity.ok(productService.createProduct(productDTO, frontImage, backImage, galleryImages));
    }

    // Admin
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductDTO> updateProduct(
            @PathVariable Long id,
            @RequestPart("product") ProductDTO productDTO,
            @RequestPart(value = "frontImage", required = false) MultipartFile frontImage,
            @RequestPart(value = "backImage", required = false) MultipartFile backImage,
            @RequestPart(value = "galleryImages", required = false) List<MultipartFile> galleryImages) {
        
        return ResponseEntity.ok(productService.updateProduct(id, productDTO, frontImage, backImage, galleryImages));
    }

    // Admin
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok().build();
    }
}
