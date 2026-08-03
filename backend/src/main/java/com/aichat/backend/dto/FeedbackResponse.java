package com.aichat.backend.dto;

import java.time.LocalDateTime;

public class FeedbackResponse {

    private Long id;
    private Integer rating;
    private String experience;
    private String suggestion;
    private String bugReport;
    private String userName;
    private String userEmail;
    private LocalDateTime createdAt;

    public FeedbackResponse() {
    }

    public FeedbackResponse(
            Long id,
            Integer rating,
            String experience,
            String suggestion,
            String bugReport,
            String userName,
            String userEmail,
            LocalDateTime createdAt
    ) {
        this.id = id;
        this.rating = rating;
        this.experience = experience;
        this.suggestion = suggestion;
        this.bugReport = bugReport;
        this.userName = userName;
        this.userEmail = userEmail;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public Integer getRating() {
        return rating;
    }

    public String getExperience() {
        return experience;
    }

    public String getSuggestion() {
        return suggestion;
    }

    public String getBugReport() {
        return bugReport;
    }

    public String getUserName() {
        return userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}