package com.aichat.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class OpenRouterService {

    private static final String SYSTEM_PROMPT = """
            You are a helpful AI personal assistant.

            Always provide clear and accurate answers.

            Format responses using valid GitHub-Flavoured Markdown whenever
            formatting improves readability.

            Markdown rules:
            - Use headings for important sections.
            - Use bullet points or numbered lists where appropriate.
            - Use bold text for important terms.
            - Wrap inline code in single backticks.
            - Wrap code blocks in triple backticks and include the language.
            - Use Markdown tables only when tabular formatting is useful.
            - Do not wrap the entire response in a Markdown code block.
            """;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${openrouter.api.url}")
    private String apiUrl;

    @Value("${openrouter.api.key}")
    private String apiKey;

    @Value("${openrouter.model}")
    private String model;

    public OpenRouterService(
            WebClient.Builder webClientBuilder,
            ObjectMapper objectMapper
    ) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    /*
     * Existing non-streaming method.
     * We are keeping this so existing backend functionality
     * will continue to work.
     */
    public String generateResponse(String userMessage) {

        validateUserMessage(userMessage);

        Map<String, Object> requestBody =
                createRequestBody(
                        userMessage.trim(),
                        false
                );

        String responseBody = webClient
                .post()
                .uri(apiUrl)
                .header(
                        HttpHeaders.AUTHORIZATION,
                        "Bearer " + apiKey
                )
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .onStatus(
                        status -> status.isError(),
                        response -> response
                                .bodyToMono(String.class)
                                .defaultIfEmpty(
                                        "Unknown OpenRouter error"
                                )
                                .flatMap(errorBody ->
                                        Mono.error(
                                                new RuntimeException(
                                                        "OpenRouter API error: "
                                                                + errorBody
                                                )
                                        )
                                )
                )
                .bodyToMono(String.class)
                .block();

        if (responseBody == null
                || responseBody.isBlank()) {

            throw new RuntimeException(
                    "OpenRouter returned an empty response"
            );
        }

        return extractCompleteResponse(
                responseBody
        );
    }

    /*
     * New streaming method.
     *
     * Each String emitted by this Flux contains only
     * the latest generated text chunk.
     */
    public Flux<String> streamResponse(
            String userMessage
    ) {
        validateUserMessage(userMessage);

        Map<String, Object> requestBody =
                createRequestBody(
                        userMessage.trim(),
                        true
                );

        return webClient
                .post()
                .uri(apiUrl)
                .header(
                        HttpHeaders.AUTHORIZATION,
                        "Bearer " + apiKey
                )
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.TEXT_EVENT_STREAM)
                .bodyValue(requestBody)
                .retrieve()
                .onStatus(
                        status -> status.isError(),
                        response -> response
                                .bodyToMono(String.class)
                                .defaultIfEmpty(
                                        "Unknown OpenRouter error"
                                )
                                .flatMap(errorBody ->
                                        Mono.error(
                                                new RuntimeException(
                                                        "OpenRouter API error: "
                                                                + errorBody
                                                )
                                        )
                                )
                )
                .bodyToFlux(String.class)
                .flatMapIterable(
                        this::splitStreamingEvent
                )
                .filter(event ->
                        event != null
                                && !event.isBlank()
                )
                .filter(event ->
                        !"[DONE]".equals(
                                cleanStreamingEvent(event)
                        )
                )
                .map(this::extractStreamingContent)
                .filter(content ->
                        content != null
                                && !content.isEmpty()
                );
    }

    private Map<String, Object> createRequestBody(
            String userMessage,
            boolean streaming
    ) {
        Map<String, Object> requestBody =
                new LinkedHashMap<>();

        requestBody.put(
                "model",
                model
        );

        requestBody.put(
                "messages",
                List.of(
                        Map.of(
                                "role",
                                "system",
                                "content",
                                SYSTEM_PROMPT
                        ),
                        Map.of(
                                "role",
                                "user",
                                "content",
                                userMessage
                        )
                )
        );

        requestBody.put(
                "stream",
                streaming
        );

        return requestBody;
    }

    private List<String> splitStreamingEvent(
            String rawEvent
    ) {
        if (rawEvent == null
                || rawEvent.isBlank()) {

            return List.of();
        }

        return rawEvent
                .lines()
                .map(String::trim)
                .filter(line ->
                        !line.isBlank()
                )
                .filter(line ->
                        !line.startsWith(":")
                )
                .toList();
    }

    private String extractStreamingContent(
            String rawEvent
    ) {
        String event =
                cleanStreamingEvent(rawEvent);

        if (event.isBlank()
                || "[DONE]".equals(event)) {

            return "";
        }

        try {
            JsonNode rootNode =
                    objectMapper.readTree(event);

            JsonNode errorNode =
                    rootNode.path("error");

            if (!errorNode.isMissingNode()
                    && !errorNode.isNull()) {

                throw new RuntimeException(
                        "OpenRouter streaming error: "
                                + errorNode
                );
            }

            JsonNode contentNode = rootNode
                    .path("choices")
                    .path(0)
                    .path("delta")
                    .path("content");

            if (contentNode.isMissingNode()
                    || contentNode.isNull()) {

                return "";
            }

            return contentNode.asText("");

        } catch (RuntimeException exception) {
            throw exception;

        } catch (Exception exception) {
            throw new RuntimeException(
                    "Failed to process OpenRouter streaming response",
                    exception
            );
        }
    }

    private String cleanStreamingEvent(
            String rawEvent
    ) {
        if (rawEvent == null) {
            return "";
        }

        String event =
                rawEvent.trim();

        if (event.startsWith("data:")) {
            event = event
                    .substring(5)
                    .trim();
        }

        return event;
    }

    private String extractCompleteResponse(
            String responseBody
    ) {
        try {
            JsonNode rootNode =
                    objectMapper.readTree(
                            responseBody
                    );

            JsonNode contentNode = rootNode
                    .path("choices")
                    .path(0)
                    .path("message")
                    .path("content");

            if (contentNode.isMissingNode()
                    || contentNode.isNull()
                    || contentNode
                    .asText()
                    .isBlank()) {

                throw new RuntimeException(
                        "AI response content was not found"
                );
            }

            return contentNode.asText();

        } catch (RuntimeException exception) {
            throw exception;

        } catch (Exception exception) {
            throw new RuntimeException(
                    "Failed to process OpenRouter response",
                    exception
            );
        }
    }

    private void validateUserMessage(
            String userMessage
    ) {
        if (userMessage == null
                || userMessage.isBlank()) {

            throw new RuntimeException(
                    "User message cannot be empty"
            );
        }
    }
}