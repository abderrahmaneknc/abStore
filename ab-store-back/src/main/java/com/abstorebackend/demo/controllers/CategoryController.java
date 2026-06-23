package com.abstorebackend.demo.controllers;

import com.abstorebackend.demo.dto.CategoryDTO;
import com.abstorebackend.demo.services.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<CategoryDTO> createCategory(
            @RequestParam("name") String name,
            @RequestParam(value = "visible", defaultValue = "true") Boolean visible,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        return ResponseEntity.ok(categoryService.createCategory(name, visible, image));
    }

    @PutMapping(path = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CategoryDTO> updateCategory(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam(value = "visible", defaultValue = "true") Boolean visible,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        return ResponseEntity.ok(categoryService.updateCategory(id, name, visible, image));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }
}
