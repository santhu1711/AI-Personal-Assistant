package com.aichat.backend.dto;

public class AIChatResponse {

    private MessageResponse userMessage;
    private MessageResponse assistantMessage;

    public AIChatResponse() {
    }

    public AIChatResponse(
            MessageResponse userMessage,
            MessageResponse assistantMessage
    ) {
        this.userMessage = userMessage;
        this.assistantMessage = assistantMessage;
    }

    public MessageResponse getUserMessage() {
        return userMessage;
    }

    public void setUserMessage(
            MessageResponse userMessage
    ) {
        this.userMessage = userMessage;
    }

    public MessageResponse getAssistantMessage() {
        return assistantMessage;
    }

    public void setAssistantMessage(
            MessageResponse assistantMessage
    ) {
        this.assistantMessage = assistantMessage;
    }
}