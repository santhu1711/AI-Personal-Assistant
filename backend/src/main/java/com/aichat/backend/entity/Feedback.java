package com.aichat.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "feedback")
public class Feedback {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    @Column(
            nullable = false
    )
    private Integer rating;

    @Column(
            nullable = false,
            length = 50
    )
    private String experience;

    @Column(
            columnDefinition = "TEXT"
    )
    private String suggestion;

    @Column(
            columnDefinition = "TEXT"
    )
    private String bugReport;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    @Column(
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    public Feedback() {
    }

    public Feedback(
            Integer rating,
            String experience,
            String suggestion,
            String bugReport,
            User user
    ) {
        this.rating = rating;
        this.experience = experience;
        this.suggestion = suggestion;
        this.bugReport = bugReport;
        this.user = user;
    }

    @PrePersist
    protected void onCreate() {
        createdAt =
                LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(
            Integer rating
    ) {
        this.rating = rating;
    }

    public String getExperience() {
        return experience;
    }

    public void setExperience(
            String experience
    ) {
        this.experience = experience;
    }

    public String getSuggestion() {
        return suggestion;
    }

    public void setSuggestion(
            String suggestion
    ) {
        this.suggestion = suggestion;
    }

    public String getBugReport() {
        return bugReport;
    }

    public void setBugReport(
            String bugReport
    ) {
        this.bugReport = bugReport;
    }

    public User getUser() {
        return user;
    }

    public void setUser(
            User user
    ) {
        this.user = user;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}