package com.aichat.backend.service;

import com.aichat.backend.entity.Document;
import com.aichat.backend.entity.DocumentChunk;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class RagService {

    private static final int MAX_RELEVANT_CHUNKS = 8;

    private static final int MAX_CONTEXT_CHARACTERS = 30000;

    private static final Set<String> STOP_WORDS =
            Set.of(
                    "a", "an", "and", "are", "as", "at",
                    "be", "by", "for", "from", "has", "have",
                    "in", "is", "it", "its", "me", "of",
                    "on", "or", "that", "the", "their", "this",
                    "to", "was", "were", "what", "which", "with",
                    "you", "your", "tell", "please"
            );

    private final DocumentChunkService documentChunkService;

    public RagService(
            DocumentChunkService documentChunkService
    ) {
        this.documentChunkService =
                documentChunkService;
    }

    public String buildContext(
            Document document,
            String question
    ) {
        if (document == null) {
            return "";
        }

        List<DocumentChunk> chunks =
                documentChunkService.getChunks(
                        document
                );

        if (chunks == null || chunks.isEmpty()) {
            return "";
        }

        String cleanQuestion =
                question == null
                        ? ""
                        : question.trim();

        List<DocumentChunk> selectedChunks;

        if (isWholeDocumentRequest(cleanQuestion)) {
            selectedChunks =
                    selectWholeDocumentChunks(
                            chunks
                    );
        } else {
            selectedChunks =
                    selectRelevantChunks(
                            chunks,
                            cleanQuestion
                    );
        }

        return buildLimitedContext(
                selectedChunks
        );
    }

    private boolean isWholeDocumentRequest(
            String question
    ) {
        String lowerQuestion =
                question.toLowerCase(
                        Locale.ROOT
                );

        return lowerQuestion.contains("summarize")
                || lowerQuestion.contains("summary")
                || lowerQuestion.contains("entire pdf")
                || lowerQuestion.contains("entire document")
                || lowerQuestion.contains("whole pdf")
                || lowerQuestion.contains("whole document")
                || lowerQuestion.contains("overview")
                || lowerQuestion.contains("main points")
                || lowerQuestion.contains("key points");
    }

    private List<DocumentChunk> selectWholeDocumentChunks(
            List<DocumentChunk> chunks
    ) {
        return new ArrayList<>(
                chunks
        );
    }

    private List<DocumentChunk> selectRelevantChunks(
            List<DocumentChunk> chunks,
            String question
    ) {
        Set<String> keywords =
                extractKeywords(
                        question
                );

        if (keywords.isEmpty()) {
            return chunks.stream()
                    .limit(MAX_RELEVANT_CHUNKS)
                    .toList();
        }

        List<ScoredChunk> scoredChunks =
                chunks.stream()
                        .map(chunk ->
                                new ScoredChunk(
                                        chunk,
                                        score(
                                                chunk.getContent(),
                                                keywords
                                        )
                                )
                        )
                        .filter(item ->
                                item.score() > 0
                        )
                        .sorted(
                                Comparator.comparingInt(
                                        ScoredChunk::score
                                ).reversed()
                        )
                        .limit(MAX_RELEVANT_CHUNKS)
                        .toList();

        if (scoredChunks.isEmpty()) {
            return chunks.stream()
                    .limit(MAX_RELEVANT_CHUNKS)
                    .toList();
        }

        return scoredChunks.stream()
                .map(ScoredChunk::chunk)
                .toList();
    }

    private Set<String> extractKeywords(
            String question
    ) {
        if (question == null
                || question.isBlank()) {
            return Set.of();
        }

        return Arrays.stream(
                        question
                                .toLowerCase(Locale.ROOT)
                                .replaceAll(
                                        "[^a-z0-9+#.\\- ]",
                                        " "
                                )
                                .split("\\s+")
                )
                .map(String::trim)
                .filter(word ->
                        !word.isBlank()
                )
                .filter(word ->
                        word.length() > 1
                )
                .filter(word ->
                        !STOP_WORDS.contains(word)
                )
                .collect(
                        Collectors.toCollection(
                                HashSet::new
                        )
                );
    }

    private int score(
            String text,
            Set<String> keywords
    ) {
        if (text == null
                || text.isBlank()) {
            return 0;
        }

        String lowerText =
                text.toLowerCase(
                        Locale.ROOT
                );

        int totalScore = 0;

        for (String keyword : keywords) {
            int occurrences =
                    countOccurrences(
                            lowerText,
                            keyword
                    );

            totalScore +=
                    occurrences * 3;

            if (lowerText.contains(keyword)) {
                totalScore += 2;
            }
        }

        return totalScore;
    }

    private int countOccurrences(
            String text,
            String keyword
    ) {
        int count = 0;
        int index = 0;

        while (
                (
                        index =
                                text.indexOf(
                                        keyword,
                                        index
                                )
                ) >= 0
        ) {
            count++;
            index += keyword.length();
        }

        return count;
    }

    private String buildLimitedContext(
            List<DocumentChunk> chunks
    ) {
        StringBuilder context =
                new StringBuilder();

        for (DocumentChunk chunk : chunks) {
            String content =
                    chunk.getContent();

            if (content == null
                    || content.isBlank()) {
                continue;
            }

            int remainingCharacters =
                    MAX_CONTEXT_CHARACTERS
                            - context.length();

            if (remainingCharacters <= 0) {
                break;
            }

            String cleanContent =
                    content.trim();

            if (
                    cleanContent.length()
                            > remainingCharacters
            ) {
                context.append(
                        cleanContent,
                        0,
                        remainingCharacters
                );

                break;
            }

            context.append(cleanContent);
            context.append("\n\n");
        }

        return context.toString().trim();
    }

    private record ScoredChunk(
            DocumentChunk chunk,
            int score
    ) {
    }
}