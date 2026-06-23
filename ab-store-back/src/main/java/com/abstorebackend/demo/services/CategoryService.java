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
