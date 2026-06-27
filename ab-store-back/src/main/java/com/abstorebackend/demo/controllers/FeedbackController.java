package com.abstorebackend.demo.controllers;

import com.abstorebackend.demo.dto.FeedbackDTO;
import com.abstorebackend.demo.services.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping
    public ResponseEntity<FeedbackDTO> submitFeedback(@Valid @RequestBody FeedbackDTO feedbackDTO) {
        return ResponseEntity.ok(feedbackService.submitFeedback(feedbackDTO));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<FeedbackDTO>> getProductFeedbacks(@PathVariable Long productId) {
        return ResponseEntity.ok(feedbackService.getVisibleFeedbacksForProduct(productId));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FeedbackDTO>> getAllFeedbacks() {
        return ResponseEntity.ok(feedbackService.getAllFeedbacks());
    }

    @PutMapping("/{id}/visibility")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FeedbackDTO> toggleVisibility(@PathVariable Long id, @RequestParam boolean visible) {
        return ResponseEntity.ok(feedbackService.toggleVisibility(id, visible));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFeedback(@PathVariable Long id) {
        feedbackService.deleteFeedback(id);
        return ResponseEntity.ok().build();
    }
}
