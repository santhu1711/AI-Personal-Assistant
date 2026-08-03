package com.aichat.backend.dto;

import java.time.LocalDateTime;

public class MessageResponse {

    private Long id;
    private String content;
    private String sender;
    private LocalDateTime createdAt;

    public MessageResponse() {
    }

    public MessageResponse(
            Long id,
            String content,
            String sender,
            LocalDateTime createdAt
    ) {
        this.id = id;
        this.content = content;
        this.sender = sender;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getContent() {
        return content;
    }

    public String getSender() {
        return sender;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}