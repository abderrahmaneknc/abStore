package com.abstorebackend.demo.config;

import com.abstorebackend.demo.entities.AdminUser;
import com.abstorebackend.demo.entities.Category;
import com.abstorebackend.demo.entities.Product;
import com.abstorebackend.demo.entities.ProductImage;
import com.abstorebackend.demo.enums.ImageType;
import com.abstorebackend.demo.repositories.AdminUserRepository;
import com.abstorebackend.demo.repositories.CategoryRepository;
import com.abstorebackend.demo.repositories.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final AdminUserRepository adminUserRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (adminUserRepository.count() == 0) {
            AdminUser admin = new AdminUser();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            adminUserRepository.save(admin);
            System.out.println("Default admin user created: admin / admin123");
        }

        if (categoryRepository.count() == 0) {
            Category cameras = new Category();
            cameras.setName("Cameras");
            cameras.setImageUrl(
                    "https://images.unsplash.com/photo-1616088886430-ccd86fef0713?w=900&auto=format&fit=crop&q=80");
            cameras.setVisible(true);

            Category accessoires = new Category();
            accessoires.setName("Accessoires");
            accessoires.setImageUrl(
                    "https://plus.unsplash.com/premium_photo-1723662135626-50b0c5547e1c?w=900&auto=format&fit=crop&q=80");
            accessoires.setVisible(true);

            Category laptop = new Category();
            laptop.setName("Laptop");
            laptop.setImageUrl(
                    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900&auto=format&fit=crop&q=80");
            laptop.setVisible(true);

            categoryRepository.saveAll(List.of(cameras, accessoires, laptop));
            System.out.println("Default categories seeded into the database.");
        }

        if (productRepository.count() == 0) {
            List<Category> categories = categoryRepository.findAll();
            Category cameras = categories.stream().filter(c -> "Cameras".equals(c.getName())).findFirst().orElse(null);
            Category accessoires = categories.stream().filter(c -> "Accessoires".equals(c.getName())).findFirst()
                    .orElse(null);
            Category laptop = categories.stream().filter(c -> "Laptop".equals(c.getName())).findFirst().orElse(null);

            List<Product> products = new ArrayList<>();

            Product p1 = new Product();
            p1.setName("Canon EOS R5");
            p1.setBrand("Canon");
            p1.setDescription(
                    "Professional full-frame mirrorless camera with high resolution, advanced autofocus, and excellent video capabilities.");
            p1.setPrice(3899.0);
            p1.setStockQty(15);
            p1.setProductStatus(null);
            p1.setIsNew(true);
            p1.setIsPromotion(true);
            p1.setRating(4.9);
            p1.setCategory(cameras);
            p1.setImages(List.of(
                    new ProductImage(null, "https://images.unsplash.com/photo-1610825469439-d49c8f41d968",
                            ImageType.FRONT, p1),
                    new ProductImage(null,
                            "https://images.unsplash.com/photo-1613235577937-9ac3eed992fc?w=500&auto=format&fit=crop&q=60",
                            ImageType.BACK, p1)));
            products.add(p1);

            Product p2 = new Product();
            p2.setName("Sony A7 IV");
            p2.setBrand("Sony");
            p2.setDescription(
                    "A hybrid full-frame camera designed for photography and videography with excellent dynamic range and autofocus.");
            p2.setPrice(2499.0);
            p2.setStockQty(12);
            p2.setProductStatus(null);
            p2.setIsNew(true);
            p2.setIsPromotion(true);
            p2.setRating(4.8);
            p2.setCategory(cameras);
            p2.setImages(List.of(
                    new ProductImage(null,
                            "https://images.unsplash.com/photo-1647920564028-5756c7af4bd1?w=500&auto=format&fit=crop&q=60",
                            ImageType.FRONT, p2),
                    new ProductImage(null,
                            "https://images.unsplash.com/photo-1710887030475-f9077ee433b5?w=500&auto=format&fit=crop&q=60",
                            ImageType.BACK, p2)));
            products.add(p2);

            Product p3 = new Product();
            p3.setName("MacBook Pro");
            p3.setBrand("Apple");
            p3.setDescription(
                    "High-performance laptop designed for professionals with powerful chips, Retina display, and long battery life.");
            p3.setPrice(2399.0);
            p3.setStockQty(10);
            p3.setProductStatus(null);
            p3.setIsNew(true);
            p3.setIsPromotion(true);
            p3.setRating(4.9);
            p3.setCategory(laptop);
            p3.setImages(List.of(
                    new ProductImage(null, "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
                            ImageType.FRONT, p3),
                    new ProductImage(null, "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
                            ImageType.BACK, p3)));
            products.add(p3);

            Product p4 = new Product();
            p4.setName("DJI RS 3 Gimbal Stabilizer");
            p4.setBrand("DJI");
            p4.setDescription("Professional 3-axis gimbal stabilizer for smooth and cinematic video recording.");
            p4.setPrice(549.0);
            p4.setStockQty(20);
            p4.setProductStatus(null);
            p4.setIsNew(true);
            p4.setIsPromotion(false);
            p4.setRating(4.7);
            p4.setCategory(accessoires);
            p4.setImages(List.of(
                    new ProductImage(null,
                            "https://images.unsplash.com/photo-1693496830158-a1881a678a48?w=500&auto=format&fit=crop&q=60",
                            ImageType.FRONT, p4),
                    new ProductImage(null,
                            "https://images.unsplash.com/photo-1667847571526-cb885b9e4764?w=500&auto=format&fit=crop&q=60",
                            ImageType.BACK, p4)));
            products.add(p4);

            productRepository.saveAll(products);
            System.out.println("Default products seeded into the database.");
        }
    }
}
