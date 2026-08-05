package com.aichat.backend.service;

import com.aichat.backend.entity.User;
import com.aichat.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserStatisticsService {

    private final UserRepository userRepository;

    public UserStatisticsService(
            UserRepository userRepository
    ) {
        this.userRepository =
                userRepository;
    }

    @Transactional
    public void incrementMessageCount(
            User user
    ) {
        if (user == null) {
            return;
        }

        Long currentCount =
                user.getMessageCount();

        if (currentCount == null) {
            currentCount = 0L;
        }

        user.setMessageCount(
                currentCount + 1
        );

        userRepository.save(user);
    }

    @Transactional
    public void incrementConversationCount(
            User user
    ) {
        if (user == null) {
            return;
        }

        Long currentCount =
                user.getConversationCount();

        if (currentCount == null) {
            currentCount = 0L;
        }

        user.setConversationCount(
                currentCount + 1
        );

        userRepository.save(user);
    }

    @Transactional
    public void incrementPdfUploadCount(
            User user
    ) {
        if (user == null) {
            return;
        }

        Long currentCount =
                user.getPdfUploadCount();

        if (currentCount == null) {
            currentCount = 0L;
        }

        user.setPdfUploadCount(
                currentCount + 1
        );

        userRepository.save(user);
    }

    @Transactional
    public void resetStatistics(
            User user
    ) {
        if (user == null) {
            return;
        }

        user.setMessageCount(0L);
        user.setConversationCount(0L);
        user.setPdfUploadCount(0L);

        userRepository.save(user);
    }
}