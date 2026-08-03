package com.aichat.backend.dto;

import java.time.LocalDateTime;

public class AdminUserResponse {

    private Long id;

    private String name;

    private String email;

    private String role;

    private LocalDateTime createdAt;

    private LocalDateTime lastLoginAt;

    private LocalDateTime lastActiveAt;

    private Long loginCount;

    private Long messageCount;

    private Long conversationCount;

    private Long pdfUploadCount;

    public AdminUserResponse() {
    }

    public AdminUserResponse(
            Long id,
            String name,
            String email,
            String role,
            LocalDateTime createdAt,
            LocalDateTime lastLoginAt,
            LocalDateTime lastActiveAt,
            Long loginCount,
            Long messageCount,
            Long conversationCount,
            Long pdfUploadCount
    ) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.createdAt = createdAt;
        this.lastLoginAt = lastLoginAt;
        this.lastActiveAt = lastActiveAt;
        this.loginCount = loginCount;
        this.messageCount = messageCount;
        this.conversationCount = conversationCount;
        this.pdfUploadCount = pdfUploadCount;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getLastLoginAt() {
        return lastLoginAt;
    }

    public LocalDateTime getLastActiveAt() {
        return lastActiveAt;
    }

    public Long getLoginCount() {
        return loginCount;
    }

    public Long getMessageCount() {
        return messageCount;
    }

    public Long getConversationCount() {
        return conversationCount;
    }

    public Long getPdfUploadCount() {
        return pdfUploadCount;
    }
}