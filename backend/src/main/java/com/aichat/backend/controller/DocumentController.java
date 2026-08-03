package com.aichat.backend.controller;

import com.aichat.backend.dto.DocumentResponse;
import com.aichat.backend.service.DocumentService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(
            DocumentService documentService
    ) {
        this.documentService =
                documentService;
    }

    @PostMapping(
            value = "/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public DocumentResponse uploadDocument(
            @RequestPart("file") MultipartFile file,
            Authentication authentication
    ) {
        return documentService
                .uploadDocument(
                        file,
                        authentication.getName()
                );
    }

    @GetMapping
    public List<DocumentResponse> getDocuments(
            Authentication authentication
    ) {
        return documentService
                .getDocuments(
                        authentication.getName()
                );
    }

    @GetMapping("/{documentId}")
    public DocumentResponse getDocument(
            @PathVariable Long documentId,
            Authentication authentication
    ) {
        return documentService
                .getDocument(
                        documentId,
                        authentication.getName()
                );
    }

    @DeleteMapping("/{documentId}")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable Long documentId,
            Authentication authentication
    ) {
        documentService
                .deleteDocument(
                        documentId,
                        authentication.getName()
                );

        return ResponseEntity
                .noContent()
                .build();
    }
}