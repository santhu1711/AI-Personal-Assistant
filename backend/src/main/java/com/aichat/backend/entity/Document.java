package com.aichat.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
public class Document {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    @Column(
            nullable = false,
            length = 255
    )
    private String fileName;

    @Column(
            nullable = false,
            length = 100
    )
    private String contentType;

    @Column(
            nullable = false
    )
    private Long fileSize;

    @Lob
    @Column(
            nullable = false,
            columnDefinition = "LONGTEXT"
    )
    private String extractedText;

    @Column(
            nullable = false
    )
    private LocalDateTime uploadedAt;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    public Document() {
    }

    public Document(
            String fileName,
            String contentType,
            Long fileSize,
            String extractedText,
            User user
    ) {
        this.fileName = fileName;
        this.contentType = contentType;
        this.fileSize = fileSize;
        this.extractedText = extractedText;
        this.user = user;
        this.uploadedAt =
                LocalDateTime.now();
    }

    @PrePersist
    public void prePersist() {

        if (uploadedAt == null) {

            uploadedAt =
                    LocalDateTime.now();
        }
    }

    public Long getId() {

        return id;
    }

    public void setId(
            Long id
    ) {

        this.id = id;
    }

    public String getFileName() {

        return fileName;
    }

    public void setFileName(
            String fileName
    ) {

        this.fileName = fileName;
    }

    public String getContentType() {

        return contentType;
    }

    public void setContentType(
            String contentType
    ) {

        this.contentType = contentType;
    }

    public Long getFileSize() {

        return fileSize;
    }

    public void setFileSize(
            Long fileSize
    ) {

        this.fileSize = fileSize;
    }

    public String getExtractedText() {

        return extractedText;
    }

    public void setExtractedText(
            String extractedText
    ) {

        this.extractedText =
                extractedText;
    }

    public LocalDateTime getUploadedAt() {

        return uploadedAt;
    }

    public void setUploadedAt(
            LocalDateTime uploadedAt
    ) {

        this.uploadedAt =
                uploadedAt;
    }

    public User getUser() {

        return user;
    }

    public void setUser(
            User user
    ) {

        this.user = user;
    }
}