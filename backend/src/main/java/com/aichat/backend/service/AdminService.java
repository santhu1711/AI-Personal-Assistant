package com.aichat.backend.service;

import com.aichat.backend.dto.AdminOverviewResponse;
import com.aichat.backend.dto.AdminUserResponse;
import com.aichat.backend.dto.FeedbackResponse;
import com.aichat.backend.entity.Feedback;
import com.aichat.backend.entity.User;
import com.aichat.backend.repository.FeedbackRepository;
import com.aichat.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final FeedbackRepository feedbackRepository;

    public AdminService(
            UserRepository userRepository,
            FeedbackRepository feedbackRepository
    ) {
        this.userRepository =
                userRepository;

        this.feedbackRepository =
                feedbackRepository;
    }

    public AdminOverviewResponse getOverview() {

        LocalDateTime now =
                LocalDateTime.now();

        LocalDateTime startOfToday =
                now.toLocalDate()
                        .atStartOfDay();

        LocalDateTime startOfWeek =
                now.minusDays(7);

        LocalDateTime startOfMonth =
                now.minusDays(30);

        return new AdminOverviewResponse(
                userRepository.count(),
                userRepository.countByLastActiveAtAfter(
                        startOfToday
                ),
                userRepository.countByLastActiveAtAfter(
                        startOfWeek
                ),
                userRepository.countByLastActiveAtAfter(
                        startOfMonth
                ),
                feedbackRepository.count(),
                feedbackRepository.findAverageRating(),
                feedbackRepository.countByRating(5),
                feedbackRepository.countByRating(4),
                feedbackRepository.countByRating(3),
                feedbackRepository.countByRating(2),
                feedbackRepository.countByRating(1)
        );
    }

    public List<AdminUserResponse> getUsers() {

        return userRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toAdminUserResponse)
                .toList();
    }

    public List<FeedbackResponse> getFeedback() {

        return feedbackRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toFeedbackResponse)
                .toList();
    }

    private AdminUserResponse toAdminUserResponse(
            User user
    ) {

        return new AdminUserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getCreatedAt(),
                user.getLastLoginAt(),
                user.getLastActiveAt(),
                safeCount(
                        user.getLoginCount()
                ),
                safeCount(
                        user.getMessageCount()
                ),
                safeCount(
                        user.getConversationCount()
                ),
                safeCount(
                        user.getPdfUploadCount()
                )
        );
    }

    private FeedbackResponse toFeedbackResponse(
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

    private long safeCount(
            Long value
    ) {

        return value == null
                ? 0L
                : value;
    }
}