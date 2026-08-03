package com.aichat.backend.service;

import com.aichat.backend.dto.FeedbackRequest;
import com.aichat.backend.dto.FeedbackResponse;
import com.aichat.backend.entity.Feedback;
import com.aichat.backend.entity.User;
import com.aichat.backend.repository.FeedbackRepository;
import com.aichat.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;

    private final UserRepository userRepository;

    public FeedbackService(
            FeedbackRepository feedbackRepository,
            UserRepository userRepository
    ) {
        this.feedbackRepository =
                feedbackRepository;

        this.userRepository =
                userRepository;
    }

    public FeedbackResponse submitFeedback(

            FeedbackRequest request,

            String email

    ) {

        validateFeedback(request);

        User user =
                getUser(email);

        Feedback feedback =
                new Feedback(

                        request.getRating(),

                        request.getExperience(),

                        request.getSuggestion(),

                        request.getBugReport(),

                        user

                );

        Feedback savedFeedback =
                feedbackRepository.save(
                        feedback
                );

        return toResponse(
                savedFeedback
        );

    }

    public List<FeedbackResponse> getAllFeedback() {

        return feedbackRepository

                .findAllByOrderByCreatedAtDesc()

                .stream()

                .map(this::toResponse)

                .toList();

    }

    private void validateFeedback(
            FeedbackRequest request
    ) {

        if (

                request.getRating() == null ||

                request.getRating() < 1 ||

                request.getRating() > 5

        ) {

            throw new RuntimeException(
                    "Rating must be between 1 and 5."
            );

        }

        if (

                request.getExperience() == null ||

                request.getExperience().isBlank()

        ) {

            throw new RuntimeException(
                    "Experience is required."
            );

        }

    }

    private User getUser(
            String email
    ) {

        return userRepository

                .findByEmail(email)

                .orElseThrow(

                        () ->
                                new RuntimeException(
                                        "User not found."
                                )

                );

    }

    private FeedbackResponse toResponse(
            Feedback feedback
    ) {

        return new FeedbackResponse(

                feedback.getId(),

                feedback.getRating(),

                feedback.getExperience(),

                feedback.getSuggestion(),

                feedback.getBugReport(),

                feedback.getUser().getName(),

                feedback.getUser().getEmail(),

                feedback.getCreatedAt()

        );

    }

}