package com.aichat.backend.repository;

import com.aichat.backend.entity.Document;
import com.aichat.backend.entity.DocumentChunk;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentChunkRepository
        extends JpaRepository<DocumentChunk, Long> {

    List<DocumentChunk> findByDocumentOrderByChunkIndexAsc(
            Document document
    );

    void deleteByDocument(
            Document document
    );
}