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
    }
}
