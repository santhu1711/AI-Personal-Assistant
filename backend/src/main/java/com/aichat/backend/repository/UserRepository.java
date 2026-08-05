package com.aichat.backend.repository;

import com.aichat.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository
        extends JpaRepository<User, Long> {

    Optional<User> findByEmail(
            String email
    );

    long countByLastActiveAtAfter(
            LocalDateTime dateTime
    );

    List<User> findAllByOrderByCreatedAtDesc();

    @Modifying
    @Transactional
    @Query("""
            UPDATE User user
            SET user.messageCount =
                COALESCE(user.messageCount, 0) + 1
            WHERE user.id = :userId
            """)
    int incrementMessageCount(
            @Param("userId") Long userId
    );

    @Modifying
    @Transactional
    @Query("""
            UPDATE User user
            SET user.conversationCount =
                COALESCE(user.conversationCount, 0) + 1
            WHERE user.id = :userId
            """)
    int incrementConversationCount(
            @Param("userId") Long userId
    );

    @Modifying
    @Transactional
    @Query("""
            UPDATE User user
            SET user.pdfUploadCount =
                COALESCE(user.pdfUploadCount, 0) + 1
            WHERE user.id = :userId
            """)
    int incrementPdfUploadCount(
            @Param("userId") Long userId
    );
}