package com.abstorebackend.demo.controllers;

import com.abstorebackend.demo.dto.FeedbackDTO;
import com.abstorebackend.demo.services.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    // Public: Submit feedback for a product
    @PostMapping
    public ResponseEntity<FeedbackDTO> submitFeedback(@RequestBody FeedbackDTO feedbackDTO) {
        return ResponseEntity.ok(feedbackService.submitFeedback(feedbackDTO));
    }

    // Public: Get visible feedbacks for a product
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<FeedbackDTO>> getProductFeedbacks(@PathVariable Long productId) {
        return ResponseEntity.ok(feedbackService.getVisibleFeedbacksForProduct(productId));
    }

    // Admin: Get all feedbacks
    @GetMapping("/all")
    public ResponseEntity<List<FeedbackDTO>> getAllFeedbacks() {
        return ResponseEntity.ok(feedbackService.getAllFeedbacks());
    }

    // Admin: Toggle visibility
    @PutMapping("/{id}/visibility")
    public ResponseEntity<FeedbackDTO> toggleVisibility(@PathVariable Long id, @RequestParam boolean visible) {
        return ResponseEntity.ok(feedbackService.toggleVisibility(id, visible));
    }

    // Admin: Delete feedback
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFeedback(@PathVariable Long id) {
        feedbackService.deleteFeedback(id);
        return ResponseEntity.ok().build();
    }
}
