package com.aichat.backend.service;

import com.aichat.backend.dto.DocumentResponse;
import com.aichat.backend.entity.Document;
import com.aichat.backend.entity.User;
import com.aichat.backend.repository.DocumentRepository;
import com.aichat.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class DocumentService {

    private static final long MAXIMUM_FILE_SIZE =
            10L * 1024L * 1024L;

    private final DocumentRepository documentRepository;

    private final UserRepository userRepository;

    private final PdfTextExtractorService pdfTextExtractorService;

    private final DocumentChunkService documentChunkService;

    private final UserStatisticsService userStatisticsService;

    public DocumentService(

            DocumentRepository documentRepository,

            UserRepository userRepository,

            PdfTextExtractorService pdfTextExtractorService,

            DocumentChunkService documentChunkService,

            UserStatisticsService userStatisticsService

    ) {

        this.documentRepository =
                documentRepository;

        this.userRepository =
                userRepository;

        this.pdfTextExtractorService =
                pdfTextExtractorService;

        this.documentChunkService =
                documentChunkService;

        this.userStatisticsService =
                userStatisticsService;

    }

    @Transactional
    public DocumentResponse uploadDocument(

            MultipartFile file,

            String email

    ) {

        validatePdfFile(file);

        User user =
                getUserByEmail(email);

        String extractedText =
                pdfTextExtractorService
                        .extractText(file);

        String originalFileName =
                file.getOriginalFilename();

        if (

                originalFileName == null
                        || originalFileName.isBlank()

        ) {

            originalFileName =
                    "document.pdf";

        }

        String contentType =
                file.getContentType();

        if (

                contentType == null
                        || contentType.isBlank()

        ) {

            contentType =
                    "application/pdf";

        }

        Document document =
                new Document(

                        originalFileName.trim(),

                        contentType,

                        file.getSize(),

                        extractedText,

                        user

                );

        Document savedDocument =
                documentRepository.save(
                        document
                );

        documentChunkService.createChunks(

                savedDocument,

                extractedText

        );

        userStatisticsService
                .incrementPdfUploadCount(
                        user
                );

        return toDocumentResponse(

                savedDocument

        );

    }

    public List<DocumentResponse> getDocuments(

            String email

    ) {

        User user =
                getUserByEmail(email);

        return documentRepository

                .findByUserOrderByUploadedAtDesc(
                        user
                )

                .stream()

                .map(this::toDocumentResponse)

                .toList();

    }

    public DocumentResponse getDocument(

            Long documentId,

            String email

    ) {

        Document document =
                getOwnedDocument(

                        documentId,

                        email

                );

        return toDocumentResponse(
                document
        );

    }

    public String getExtractedText(

            Long documentId,

            String email

    ) {

        Document document =
                getOwnedDocument(

                        documentId,

                        email

                );

        return document.getExtractedText();

    }

    @Transactional
    public void deleteDocument(

            Long documentId,

            String email

    ) {

        Document document =
                getOwnedDocument(

                        documentId,

                        email

                );

        documentRepository.delete(
                document
        );

    }

    private void validatePdfFile(

            MultipartFile file

    ) {

        if (

                file == null
                        || file.isEmpty()

        ) {

            throw new RuntimeException(
                    "Please select a PDF file."
            );

        }

        if (

                file.getSize()
                        > MAXIMUM_FILE_SIZE

        ) {

            throw new RuntimeException(
                    "PDF file size must not exceed 10 MB."
            );

        }

        String fileName =
                file.getOriginalFilename();

        String contentType =
                file.getContentType();

        boolean validExtension =

                fileName != null
                        &&
                        fileName
                                .toLowerCase()
                                .endsWith(".pdf");

        boolean validContentType =

                "application/pdf"
                        .equalsIgnoreCase(
                                contentType
                        );

        if (

                !validExtension
                        &&
                        !validContentType

        ) {

            throw new RuntimeException(
                    "Only PDF files are supported."
            );

        }

    }

    private User getUserByEmail(

            String email

    ) {

        if (

                email == null
                        ||
                        email.isBlank()

        ) {

            throw new RuntimeException(
                    "Authenticated user email is required."
            );

        }

        return userRepository

                .findByEmail(email)

                .orElseThrow(

                        () ->
                                new RuntimeException(
                                        "User not found."
                                )

                );

    }

    private Document getOwnedDocument(

            Long documentId,

            String email

    ) {

        if (

                documentId == null

        ) {

            throw new RuntimeException(
                    "Document ID is required."
            );

        }

        User user =
                getUserByEmail(email);

        return documentRepository

                .findByIdAndUser(

                        documentId,

                        user

                )

                .orElseThrow(

                        () ->
                                new RuntimeException(
                                        "Document not found or access denied."
                                )

                );

    }

    private DocumentResponse toDocumentResponse(

            Document document

    ) {

        return new DocumentResponse(

                document.getId(),

                document.getFileName(),

                document.getContentType(),

                document.getFileSize(),

                document.getUploadedAt()

        );

    }

}