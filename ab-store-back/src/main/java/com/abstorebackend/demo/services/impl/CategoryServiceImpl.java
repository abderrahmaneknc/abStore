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
