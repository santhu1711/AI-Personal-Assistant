package com.aichat.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "conversations")
public class Conversation {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    @Column(
            nullable = false,
            length = 150
    )
    private String title;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    /*
     * Optional.
     *
     * A conversation may or may not
     * be linked to a document.
     */

    @ManyToOne(
            fetch = FetchType.LAZY
    )
    @JoinColumn(
            name = "document_id"
    )
    private Document document;

    @Column(
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @Column(
            nullable = false
    )
    private LocalDateTime updatedAt;

    public Conversation() {
    }

    public Conversation(

            String title,

            User user

    ) {

        this.title = title;
        this.user = user;

    }

    @PrePersist
    protected void onCreate() {

        LocalDateTime now =
                LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

    }

    @PreUpdate
    protected void onUpdate() {

        updatedAt =
                LocalDateTime.now();

    }

    public Long getId() {

        return id;

    }

    public String getTitle() {

        return title;

    }

    public void setTitle(

            String title

    ) {

        this.title = title;

    }

    public User getUser() {

        return user;

    }

    public void setUser(

            User user

    ) {

        this.user = user;

    }

    public Document getDocument() {

        return document;

    }

    public void setDocument(

            Document document

    ) {

        this.document = document;

    }

    public LocalDateTime getCreatedAt() {

        return createdAt;

    }

    public LocalDateTime getUpdatedAt() {

        return updatedAt;

    }

    public void setUpdatedAt(

            LocalDateTime updatedAt

    ) {

        this.updatedAt = updatedAt;

    }

}