package com.aichat.backend.dto;

public class UpdateMessageRequest {

    private String content;

    public UpdateMessageRequest() {
    }

    public String getContent() {
        return content;
    }

    public void setContent(
            String content
    ) {
        this.content = content;
    }
}