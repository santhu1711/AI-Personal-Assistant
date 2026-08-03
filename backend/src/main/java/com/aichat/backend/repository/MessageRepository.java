package com.aichat.backend.repository;

import com.aichat.backend.entity.Conversation;
import com.aichat.backend.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository
        extends JpaRepository<Message, Long> {

    List<Message> findByConversationOrderByCreatedAtAsc(
            Conversation conversation
    );

    void deleteByConversation(
            Conversation conversation
    );
}