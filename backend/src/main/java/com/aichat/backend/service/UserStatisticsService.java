package com.aichat.backend.service;

import com.aichat.backend.entity.User;
import com.aichat.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserStatisticsService {

    private final UserRepository userRepository;

    public UserStatisticsService(
            UserRepository userRepository
    ) {
        this.userRepository =
                userRepository;
    }

    public void incrementMessageCount(
            User user
    ) {
        validateUser(user);

        int updatedRows =
                userRepository.incrementMessageCount(
                        user.getId()
                );

        System.out.println(
                "[STATISTICS] Message count update"
                        + " | userId=" + user.getId()
                        + " | email=" + user.getEmail()
                        + " | updatedRows=" + updatedRows
        );

        validateUpdate(
                updatedRows,
                "message"
        );
    }

    public void incrementConversationCount(
            User user
    ) {
        validateUser(user);

        int updatedRows =
                userRepository.incrementConversationCount(
                        user.getId()
                );

        System.out.println(
                "[STATISTICS] Conversation count update"
                        + " | userId=" + user.getId()
                        + " | email=" + user.getEmail()
                        + " | updatedRows=" + updatedRows
        );

        validateUpdate(
                updatedRows,
                "conversation"
        );
    }

    public void incrementPdfUploadCount(
            User user
    ) {
        validateUser(user);

        int updatedRows =
                userRepository.incrementPdfUploadCount(
                        user.getId()
                );

        System.out.println(
                "[STATISTICS] PDF upload count update"
                        + " | userId=" + user.getId()
                        + " | email=" + user.getEmail()
                        + " | updatedRows=" + updatedRows
        );

        validateUpdate(
                updatedRows,
                "PDF upload"
        );
    }

    private void validateUser(
            User user
    ) {
        if (
                user == null ||
                user.getId() == null
        ) {
            throw new RuntimeException(
                    "A valid user is required to update statistics."
            );
        }
    }

    private void validateUpdate(
            int updatedRows,
            String statisticName
    ) {
        if (updatedRows == 0) {
            throw new RuntimeException(
                    "Failed to update "
                            + statisticName
                            + " statistics."
            );
        }
    }
}