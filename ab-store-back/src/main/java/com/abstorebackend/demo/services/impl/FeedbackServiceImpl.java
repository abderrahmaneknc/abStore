package com.abstorebackend.demo.services.impl;

import com.abstorebackend.demo.dto.FeedbackDTO;
import com.abstorebackend.demo.entities.Feedback;
import com.abstorebackend.demo.entities.Product;
import com.abstorebackend.demo.exceptions.ResourceNotFoundException;
import com.abstorebackend.demo.repositories.FeedbackRepository;
import com.abstorebackend.demo.repositories.ProductRepository;
import com.abstorebackend.demo.services.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final ProductRepository productRepository;

    private FeedbackDTO mapToDTO(Feedback feedback) {
        FeedbackDTO dto = new FeedbackDTO();
        dto.setId(feedback.getId());
        dto.setName(feedback.getName());
        dto.setMessage(feedback.getMessage());
        dto.setRating(feedback.getRating());
        dto.setVisible(feedback.getVisible());
        dto.setCreatedAt(feedback.getCreatedAt());
        if (feedback.getProduct() != null) {
            dto.setProductId(feedback.getProduct().getId());
        }
        return dto;
    }

    @Override
    @Transactional
    public FeedbackDTO submitFeedback(FeedbackDTO dto) {
        Feedback feedback = new Feedback();
        feedback.setName(dto.getName());
        feedback.setMessage(dto.getMessage());
        feedback.setRating(dto.getRating() != null ? dto.getRating() : 5);
        feedback.setVisible(true);

        if (dto.getProductId() != null) {
            Product product = productRepository.findById(dto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
            feedback.setProduct(product);
        }

        Feedback savedFeedback = feedbackRepository.save(feedback);

        if (savedFeedback.getProduct() != null) {
            updateProductRating(savedFeedback.getProduct());
        }

        return mapToDTO(savedFeedback);
    }

    @Override
    public List<FeedbackDTO> getVisibleFeedbacksForProduct(Long productId) {
        return feedbackRepository.findByProductIdAndVisibleTrue(productId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<FeedbackDTO> getAllFeedbacks() {
        return feedbackRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FeedbackDTO toggleVisibility(Long id, boolean visible) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found"));
        feedback.setVisible(visible);
        Feedback saved = feedbackRepository.save(feedback);

        if (saved.getProduct() != null) {
            updateProductRating(saved.getProduct());
        }

        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public void deleteFeedback(Long id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found"));
        Product product = feedback.getProduct();
        feedbackRepository.deleteById(id);
        
        if (product != null) {
            updateProductRating(product);
        }
    }

    private void updateProductRating(Product product) {
        List<Feedback> visibleFeedbacks = feedbackRepository.findByProductIdAndVisibleTrue(product.getId());
        if (visibleFeedbacks.isEmpty()) {
            product.setRating(0.0);
        } else {
            double avg = visibleFeedbacks.stream()
                    .mapToInt(Feedback::getRating)
                    .average()
                    .orElse(0.0);
            product.setRating(Math.round(avg * 10.0) / 10.0); // 1 decimal place
        }
        productRepository.save(product);
    }
}
