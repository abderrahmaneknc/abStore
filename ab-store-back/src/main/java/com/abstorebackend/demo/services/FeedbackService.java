package com.abstorebackend.demo.services;

import com.abstorebackend.demo.dto.FeedbackDTO;
import java.util.List;

public interface FeedbackService {
    FeedbackDTO submitFeedback(FeedbackDTO dto);
    List<FeedbackDTO> getVisibleFeedbacksForProduct(Long productId);
    List<FeedbackDTO> getAllFeedbacks();
    FeedbackDTO toggleVisibility(Long id, boolean visible);
    void deleteFeedback(Long id);
}
