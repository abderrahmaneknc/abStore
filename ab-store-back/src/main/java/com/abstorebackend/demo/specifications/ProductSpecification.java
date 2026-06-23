package com.abstorebackend.demo.specifications;
import com.abstorebackend.demo.entities.Product;
import com.abstorebackend.demo.enums.ProductStatus;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

public class ProductSpecification {
    public static Specification<Product> filterProducts(
            String search, Long categoryId, Double minPrice, Double maxPrice,
            String brand, ProductStatus productStatus, Boolean isNew, Boolean isPromotion) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.trim().isEmpty()) {
                String likePattern = "%" + search.toLowerCase() + "%";
                Predicate namePredicate = cb.like(cb.lower(root.get("name")), likePattern);
                Predicate brandPredicate = cb.like(cb.lower(root.get("brand")), likePattern);
                predicates.add(cb.or(namePredicate, brandPredicate));
            }

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            
            if (minPrice != null) predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            if (maxPrice != null) predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            if (brand != null && !brand.isEmpty()) predicates.add(cb.equal(cb.lower(root.get("brand")), brand.toLowerCase()));
            if (productStatus != null) predicates.add(cb.equal(root.get("productStatus"), productStatus));
            if (isNew != null) predicates.add(cb.equal(root.get("isNew"), isNew));
            if (isPromotion != null) predicates.add(cb.equal(root.get("isPromotion"), isPromotion));

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
