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
