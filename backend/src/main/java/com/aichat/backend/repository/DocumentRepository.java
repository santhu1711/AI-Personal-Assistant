package com.aichat.backend.repository;

import com.aichat.backend.entity.Document;
import com.aichat.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DocumentRepository
        extends JpaRepository<Document, Long> {

    List<Document> findByUserOrderByUploadedAtDesc(
            User user
    );

    Optional<Document> findByIdAndUser(
            Long id,
            User user
    );

    boolean existsByIdAndUser(
            Long id,
            User user
    );
}