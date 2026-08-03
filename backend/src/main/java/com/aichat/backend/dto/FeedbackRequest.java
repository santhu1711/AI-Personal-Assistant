package com.aichat.backend.dto;

public class FeedbackRequest {

    private Integer rating;
    private String experience;
    private String suggestion;
    private String bugReport;

    public FeedbackRequest() {
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
}