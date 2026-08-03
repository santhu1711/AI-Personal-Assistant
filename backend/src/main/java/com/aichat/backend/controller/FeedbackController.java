package com.aichat.backend.controller;

import com.aichat.backend.dto.FeedbackRequest;
import com.aichat.backend.dto.FeedbackResponse;
import com.aichat.backend.service.FeedbackService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "*")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(
            FeedbackService feedbackService
    ) {
        this.feedbackService =
                feedbackService;
    }

    @PostMapping
    public FeedbackResponse submitFeedback(
            @RequestBody FeedbackRequest request,
            Authentication authentication
    ) {
        return feedbackService.submitFeedback(
                request,
                authentication.getName()
        );
    }

    @GetMapping
    public List<FeedbackResponse> getAllFeedback() {
        return feedbackService.getAllFeedback();
    }
}