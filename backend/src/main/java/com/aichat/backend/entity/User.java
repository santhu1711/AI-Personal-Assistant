package com.aichat.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    @Column(
            nullable = false
    )
    private String name;

    @Column(
            nullable = false,
            unique = true
    )
    private String email;

    @Column(
            nullable = false
    )
    private String password;

    @Enumerated(
            EnumType.STRING
    )
    @Column(
            nullable = false,
            length = 20
    )
    private UserRole role =
            UserRole.USER;

    @Column(
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    private LocalDateTime lastLoginAt;

    private LocalDateTime lastActiveAt;

    @Column(
            nullable = false
    )
    private Long loginCount =
            0L;

    @Column(
            nullable = false
    )
    private Long messageCount =
            0L;

    @Column(
            nullable = false
    )
    private Long conversationCount =
            0L;

    @Column(
            nullable = false
    )
    private Long pdfUploadCount =
            0L;

    public User() {
    }

    public User(
            String name,
            String email,
            String password
    ) {
        this.name =
                name;

        this.email =
                email;

        this.password =
                password;

        this.role =
                UserRole.USER;
    }

    @PrePersist
    protected void onCreate() {

        LocalDateTime now =
                LocalDateTime.now();

        if (createdAt == null) {
            createdAt =
                    now;
        }

        if (role == null) {
            role =
                    UserRole.USER;
        }

        if (loginCount == null) {
            loginCount =
                    0L;
        }

        if (messageCount == null) {
            messageCount =
                    0L;
        }

        if (conversationCount == null) {
            conversationCount =
                    0L;
        }

        if (pdfUploadCount == null) {
            pdfUploadCount =
                    0L;
        }
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(
            String name
    ) {
        this.name =
                name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(
            String email
    ) {
        this.email =
                email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(
            String password
    ) {
        this.password =
                password;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(
            UserRole role
    ) {
        this.role =
                role;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getLastLoginAt() {
        return lastLoginAt;
    }

    public void setLastLoginAt(
            LocalDateTime lastLoginAt
    ) {
        this.lastLoginAt =
                lastLoginAt;
    }

    public LocalDateTime getLastActiveAt() {
        return lastActiveAt;
    }

    public void setLastActiveAt(
            LocalDateTime lastActiveAt
    ) {
        this.lastActiveAt =
                lastActiveAt;
    }

    public Long getLoginCount() {
        return loginCount;
    }

    public void setLoginCount(
            Long loginCount
    ) {
        this.loginCount =
                loginCount;
    }

    public Long getMessageCount() {
        return messageCount;
    }

    public void setMessageCount(
            Long messageCount
    ) {
        this.messageCount =
                messageCount;
    }

    public Long getConversationCount() {
        return conversationCount;
    }

    public void setConversationCount(
            Long conversationCount
    ) {
        this.conversationCount =
                conversationCount;
    }

    public Long getPdfUploadCount() {
        return pdfUploadCount;
    }

    public void setPdfUploadCount(
            Long pdfUploadCount
    ) {
        this.pdfUploadCount =
                pdfUploadCount;
    }
}