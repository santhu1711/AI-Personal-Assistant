package com.aichat.backend.service;

import com.aichat.backend.entity.Document;
import com.aichat.backend.entity.DocumentChunk;
import com.aichat.backend.repository.DocumentChunkRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class DocumentChunkService {

    /*
     * Characters per chunk.
     *
     * We intentionally keep this around 700.
     * This works well for GPT models.
     */
    private static final int CHUNK_SIZE = 700;

    /*
     * Small overlap preserves context
     * between neighbouring chunks.
     */
    private static final int OVERLAP = 100;

    private final DocumentChunkRepository documentChunkRepository;

    public DocumentChunkService(
            DocumentChunkRepository documentChunkRepository
    ) {
        this.documentChunkRepository =
                documentChunkRepository;
    }

    public void createChunks(

            Document document,
            String extractedText

    ) {

        if (

                extractedText == null
                        || extractedText.isBlank()

        ) {

            return;
        }

        documentChunkRepository
                .deleteByDocument(document);

        List<DocumentChunk> chunks =
                new ArrayList<>();

        int start = 0;

        int index = 0;

        while (

                start < extractedText.length()

        ) {

            int end =
                    Math.min(

                            start + CHUNK_SIZE,
                            extractedText.length()

                    );

            String chunk =
                    extractedText.substring(
                            start,
                            end
                    );

            chunks.add(

                    new DocumentChunk(

                            index++,
                            chunk.trim(),
                            document

                    )

            );

            if (

                    end == extractedText.length()

            ) {

                break;
            }

            start =
                    end - OVERLAP;
        }

        documentChunkRepository
                .saveAll(chunks);

    }

    public List<DocumentChunk> getChunks(
            Document document
    ) {

        return documentChunkRepository
                .findByDocumentOrderByChunkIndexAsc(
                        document
                );
    }

}