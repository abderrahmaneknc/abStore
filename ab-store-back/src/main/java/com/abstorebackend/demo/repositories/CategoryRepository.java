package com.abstorebackend.demo.repositories;

import com.abstorebackend.demo.entities.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByVisibleTrue();

    Optional<Category> findByName(String name);
}
