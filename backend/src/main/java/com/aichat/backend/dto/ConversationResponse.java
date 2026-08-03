package com.aichat.backend.dto;

import java.time.LocalDateTime;

public class ConversationResponse {

    private Long id;

    private String title;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    /*
     * Attached document
     */

    private Long documentId;

    private String documentName;

    public ConversationResponse() {
    }

    public ConversationResponse(

            Long id,

            String title,

            LocalDateTime createdAt,

            LocalDateTime updatedAt,

            Long documentId,

            String documentName

    ) {

        this.id = id;
        this.title = title;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.documentId = documentId;
        this.documentName = documentName;

    }

    public Long getId() {

        return id;

    }

    public String getTitle() {

        return title;

    }

    public LocalDateTime getCreatedAt() {

        return createdAt;

    }

    public LocalDateTime getUpdatedAt() {

        return updatedAt;

    }

    public Long getDocumentId() {

        return documentId;

    }

    public String getDocumentName() {

        return documentName;

    }

    public void setDocumentId(

            Long documentId

    ) {

        this.documentId = documentId;

    }

    public void setDocumentName(

            String documentName

    ) {

        this.documentName = documentName;

    }

}