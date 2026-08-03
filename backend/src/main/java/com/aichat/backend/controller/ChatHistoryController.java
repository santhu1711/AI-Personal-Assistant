package com.aichat.backend.controller;

import com.aichat.backend.dto.AIChatResponse;
import com.aichat.backend.dto.ConversationRenameRequest;
import com.aichat.backend.dto.ConversationResponse;
import com.aichat.backend.dto.CreateConversationRequest;
import com.aichat.backend.dto.MessageResponse;
import com.aichat.backend.dto.SendMessageRequest;
import com.aichat.backend.dto.UpdateMessageRequest;
import com.aichat.backend.service.ChatHistoryService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ChatHistoryController {

    private final ChatHistoryService chatHistoryService;
    private final ObjectMapper objectMapper;

    public ChatHistoryController(
            ChatHistoryService chatHistoryService,
            ObjectMapper objectMapper
    ) {
        this.chatHistoryService =
                chatHistoryService;

        this.objectMapper =
                objectMapper;
    }

    @PostMapping("/conversations")
    public ConversationResponse createConversation(
            @RequestBody CreateConversationRequest request,
            Authentication authentication
    ) {
        String title =
                request.getTitle();

        if (
                title == null ||
                title.isBlank()
        ) {
            title =
                    "New Conversation";
        }

        return chatHistoryService
                .createConversation(
                        authentication.getName(),
                        title.trim()
                );
    }

    @GetMapping("/conversations")
    public List<ConversationResponse> getConversations(
            Authentication authentication
    ) {
        return chatHistoryService
                .getConversations(
                        authentication.getName()
                );
    }

    @PutMapping("/conversations/{conversationId}")
    public ConversationResponse renameConversation(
            @PathVariable Long conversationId,
            @RequestBody ConversationRenameRequest request,
            Authentication authentication
    ) {
        return chatHistoryService
                .renameConversation(
                        conversationId,
                        authentication.getName(),
                        request.getTitle()
                );
    }

    @PostMapping(
            "/conversations/{conversationId}/attach/{documentId}"
    )
    public ConversationResponse attachDocument(
            @PathVariable Long conversationId,
            @PathVariable Long documentId,
            Authentication authentication
    ) {
        return chatHistoryService
                .attachDocument(
                        conversationId,
                        documentId,
                        authentication.getName()
                );
    }

    @DeleteMapping(
            "/conversations/{conversationId}/detach"
    )
    public ConversationResponse detachDocument(
            @PathVariable Long conversationId,
            Authentication authentication
    ) {
        return chatHistoryService
                .detachDocument(
                        conversationId,
                        authentication.getName()
                );
    }

    @PostMapping("/messages")
    public MessageResponse saveMessage(
            @RequestBody SendMessageRequest request,
            Authentication authentication
    ) {
        return chatHistoryService
                .saveMessage(
                        request.getConversationId(),
                        authentication.getName(),
                        "USER",
                        request.getContent()
                );
    }

    @PutMapping(
            "/conversations/{conversationId}/messages/{messageId}"
    )
    public MessageResponse updateUserMessage(
            @PathVariable Long conversationId,
            @PathVariable Long messageId,
            @RequestBody UpdateMessageRequest request,
            Authentication authentication
    ) {
        return chatHistoryService
                .updateUserMessage(
                        conversationId,
                        messageId,
                        authentication.getName(),
                        request.getContent()
                );
    }

    @PostMapping("/chat")
    public AIChatResponse chatWithAI(
            @RequestBody SendMessageRequest request,
            Authentication authentication
    ) {
        return chatHistoryService
                .sendMessageToAI(
                        request.getConversationId(),
                        authentication.getName(),
                        request.getContent()
                );
    }

    @PostMapping(
            value = "/chat/stream",
            produces = MediaType.TEXT_EVENT_STREAM_VALUE
    )
    public Flux<String> streamChatWithAI(
            @RequestBody SendMessageRequest request,
            Authentication authentication
    ) {
        return chatHistoryService
                .streamMessageToAI(
                        request.getConversationId(),
                        authentication.getName(),
                        request.getContent()
                )
                .map(
                        this::createStreamingJson
                );
    }

    @PostMapping(
            value =
                    "/conversations/{conversationId}/messages/{messageId}/regenerate",
            produces =
                    MediaType.TEXT_EVENT_STREAM_VALUE
    )
    public Flux<String> regenerateMessage(
            @PathVariable Long conversationId,
            @PathVariable Long messageId,
            Authentication authentication
    ) {
        return chatHistoryService
                .regenerateMessageToAI(
                        conversationId,
                        messageId,
                        authentication.getName()
                )
                .map(
                        this::createStreamingJson
                );
    }

    @GetMapping("/messages/{conversationId}")
    public List<MessageResponse> getMessages(
            @PathVariable Long conversationId,
            Authentication authentication
    ) {
        return chatHistoryService
                .getMessages(
                        conversationId,
                        authentication.getName()
                );
    }

    @DeleteMapping("/conversations/{conversationId}")
    public ResponseEntity<Void> deleteConversation(
            @PathVariable Long conversationId,
            Authentication authentication
    ) {
        chatHistoryService
                .deleteConversation(
                        conversationId,
                        authentication.getName()
                );

        return ResponseEntity
                .noContent()
                .build();
    }

    private String createStreamingJson(
            String content
    ) {
        Map<String, String> event =
                new LinkedHashMap<>();

        event.put(
                "content",
                content == null
                        ? ""
                        : content
        );

        try {
            return objectMapper
                    .writeValueAsString(
                            event
                    );

        } catch (
                JsonProcessingException exception
        ) {
            throw new RuntimeException(
                    "Failed to prepare AI streaming response",
                    exception
            );
        }
    }
}