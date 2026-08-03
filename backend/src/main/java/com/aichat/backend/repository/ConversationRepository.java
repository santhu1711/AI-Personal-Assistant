package com.aichat.backend.repository;

import com.aichat.backend.entity.Conversation;
import com.aichat.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConversationRepository
        extends JpaRepository<Conversation, Long> {

    List<Conversation> findByUserOrderByUpdatedAtDesc(
            User user
    );
}