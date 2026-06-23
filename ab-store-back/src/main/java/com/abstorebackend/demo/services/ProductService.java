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
