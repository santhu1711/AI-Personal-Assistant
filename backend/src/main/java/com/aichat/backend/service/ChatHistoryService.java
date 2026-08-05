package com.aichat.backend.service;

import com.aichat.backend.dto.AIChatResponse;
import com.aichat.backend.dto.ConversationResponse;
import com.aichat.backend.dto.MessageResponse;
import com.aichat.backend.entity.Conversation;
import com.aichat.backend.entity.Document;
import com.aichat.backend.entity.Message;
import com.aichat.backend.entity.User;
import com.aichat.backend.repository.ConversationRepository;
import com.aichat.backend.repository.DocumentRepository;
import com.aichat.backend.repository.MessageRepository;
import com.aichat.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChatHistoryService {

    private static final String DEFAULT_TITLE =
            "New Conversation";

    private static final int MAX_AUTO_TITLE_LENGTH =
            45;

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;
    private final OpenRouterService openRouterService;
    private final RagService ragService;
    private final UserStatisticsService userStatisticsService;

    public ChatHistoryService(
            ConversationRepository conversationRepository,
            MessageRepository messageRepository,
            UserRepository userRepository,
            DocumentRepository documentRepository,
            OpenRouterService openRouterService,
            RagService ragService,
            UserStatisticsService userStatisticsService
    ) {
        this.conversationRepository =
                conversationRepository;

        this.messageRepository =
                messageRepository;

        this.userRepository =
                userRepository;

        this.documentRepository =
                documentRepository;

        this.openRouterService =
                openRouterService;

        this.ragService =
                ragService;

        this.userStatisticsService =
                userStatisticsService;
    }

    @Transactional
    public ConversationResponse createConversation(
            String email,
            String title
    ) {
        User user =
                getUserByEmail(email);

        String conversationTitle =
                title == null || title.isBlank()
                        ? DEFAULT_TITLE
                        : title.trim();

        Conversation conversation =
                new Conversation(
                        conversationTitle,
                        user
                );

        Conversation savedConversation =
                conversationRepository.save(
                        conversation
                );

        userStatisticsService
                .incrementConversationCount(
                        user
                );

        return toConversationResponse(
                savedConversation
        );
    }

    public List<ConversationResponse> getConversations(
            String email
    ) {
        User user =
                getUserByEmail(email);

        return conversationRepository
                .findByUserOrderByUpdatedAtDesc(
                        user
                )
                .stream()
                .map(this::toConversationResponse)
                .toList();
    }

    @Transactional
    public ConversationResponse renameConversation(
            Long conversationId,
            String email,
            String title
    ) {
        Conversation conversation =
                getOwnedConversation(
                        conversationId,
                        email
                );

        if (
                title == null ||
                title.isBlank()
        ) {
            throw new RuntimeException(
                    "Conversation title cannot be empty"
            );
        }

        conversation.setTitle(
                title.trim()
        );

        conversation.setUpdatedAt(
                LocalDateTime.now()
        );

        Conversation savedConversation =
                conversationRepository.save(
                        conversation
                );

        return toConversationResponse(
                savedConversation
        );
    }

    @Transactional
    public MessageResponse saveMessage(
            Long conversationId,
            String email,
            String sender,
            String content
    ) {
        validateMessageRequest(
                conversationId,
                content
        );

        Conversation conversation =
                getOwnedConversation(
                        conversationId,
                        email
                );

        String cleanContent =
                content.trim();

        Message savedMessage =
                messageRepository.save(
                        new Message(
                                cleanContent,
                                sender,
                                conversation
                        )
                );

        if (
                "USER".equalsIgnoreCase(
                        sender
                )
        ) {
            updateConversationTitleIfRequired(
                    conversation,
                    cleanContent
            );

            userStatisticsService
                    .incrementMessageCount(
                            conversation.getUser()
                    );
        }

        updateConversationTime(
                conversation
        );

        return toMessageResponse(
                savedMessage
        );
    }

    @Transactional
    public MessageResponse updateUserMessage(
            Long conversationId,
            Long messageId,
            String email,
            String content
    ) {
        validateMessageRequest(
                conversationId,
                content
        );

        if (messageId == null) {
            throw new RuntimeException(
                    "Message ID is required"
            );
        }

        Conversation conversation =
                getOwnedConversation(
                        conversationId,
                        email
                );

        Message message =
                messageRepository
                        .findById(messageId)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Message not found"
                                        )
                        );

        validateMessageBelongsToConversation(
                message,
                conversation
        );

        if (
                !"USER".equalsIgnoreCase(
                        message.getSender()
                )
        ) {
            throw new RuntimeException(
                    "Only user messages can be edited"
            );
        }

        message.setContent(
                content.trim()
        );

        Message updatedMessage =
                messageRepository.save(
                        message
                );

        updateConversationTime(
                conversation
        );

        return toMessageResponse(
                updatedMessage
        );
    }

    @Transactional
    public AIChatResponse sendMessageToAI(
            Long conversationId,
            String email,
            String content
    ) {
        validateMessageRequest(
                conversationId,
                content
        );

        Conversation conversation =
                getOwnedConversation(
                        conversationId,
                        email
                );

        String cleanContent =
                content.trim();

        updateConversationTitleIfRequired(
                conversation,
                cleanContent
        );

        Message savedUserMessage =
                messageRepository.save(
                        new Message(
                                cleanContent,
                                "USER",
                                conversation
                        )
                );

        userStatisticsService
                .incrementMessageCount(
                        conversation.getUser()
                );

        String aiPrompt =
                buildAiPrompt(
                        conversation,
                        cleanContent
                );

        String aiResponse =
                openRouterService
                        .generateResponse(
                                aiPrompt
                        );

        Message savedAssistantMessage =
                messageRepository.save(
                        new Message(
                                aiResponse,
                                "ASSISTANT",
                                conversation
                        )
                );

        updateConversationTime(
                conversation
        );

        return new AIChatResponse(
                toMessageResponse(
                        savedUserMessage
                ),
                toMessageResponse(
                        savedAssistantMessage
                )
        );
    }

    public Flux<String> streamMessageToAI(
            Long conversationId,
            String email,
            String content
    ) {
        return Flux.defer(
                () -> {
                    validateMessageRequest(
                            conversationId,
                            content
                    );

                    Conversation conversation =
                            getOwnedConversation(
                                    conversationId,
                                    email
                            );

                    String cleanContent =
                            content.trim();

                    updateConversationTitleIfRequired(
                            conversation,
                            cleanContent
                    );

                    messageRepository.save(
                            new Message(
                                    cleanContent,
                                    "USER",
                                    conversation
                            )
                    );

                    userStatisticsService
                            .incrementMessageCount(
                                    conversation.getUser()
                            );

                    updateConversationTime(
                            conversation
                    );

                    String aiPrompt =
                            buildAiPrompt(
                                    conversation,
                                    cleanContent
                            );

                    StringBuilder completeResponse =
                            new StringBuilder();

                    return openRouterService
                            .streamResponse(
                                    aiPrompt
                            )
                            .doOnNext(
                                    completeResponse::append
                            )
                            .doOnComplete(
                                    () -> {
                                        if (
                                                completeResponse
                                                        .isEmpty()
                                        ) {
                                            return;
                                        }

                                        messageRepository.save(
                                                new Message(
                                                        completeResponse
                                                                .toString(),
                                                        "ASSISTANT",
                                                        conversation
                                                )
                                        );

                                        updateConversationTime(
                                                conversation
                                        );
                                    }
                            );
                }
        );
    }

    public Flux<String> regenerateMessageToAI(
            Long conversationId,
            Long userMessageId,
            String email
    ) {
        return Flux.defer(
                () -> {
                    if (userMessageId == null) {
                        throw new RuntimeException(
                                "User message ID is required"
                        );
                    }

                    Conversation conversation =
                            getOwnedConversation(
                                    conversationId,
                                    email
                            );

                    Message userMessage =
                            messageRepository
                                    .findById(userMessageId)
                                    .orElseThrow(
                                            () ->
                                                    new RuntimeException(
                                                            "User message not found"
                                                    )
                                    );

                    validateMessageBelongsToConversation(
                            userMessage,
                            conversation
                    );

                    if (
                            !"USER".equalsIgnoreCase(
                                    userMessage.getSender()
                            )
                    ) {
                        throw new RuntimeException(
                                "Only a user message can be regenerated"
                        );
                    }

                    String cleanContent =
                            userMessage
                                    .getContent()
                                    .trim();

                    List<Message> conversationMessages =
                            messageRepository
                                    .findByConversationOrderByCreatedAtAsc(
                                            conversation
                                    );

                    int userMessageIndex =
                            findMessageIndex(
                                    conversationMessages,
                                    userMessageId
                            );

                    if (userMessageIndex < 0) {
                        throw new RuntimeException(
                                "User message could not be located"
                        );
                    }

                    if (
                            userMessageIndex + 1 <
                            conversationMessages.size()
                    ) {
                        List<Message> laterMessages =
                                List.copyOf(
                                        conversationMessages
                                                .subList(
                                                        userMessageIndex + 1,
                                                        conversationMessages.size()
                                                )
                                );

                        messageRepository.deleteAll(
                                laterMessages
                        );

                        messageRepository.flush();
                    }

                    String aiPrompt =
                            buildAiPrompt(
                                    conversation,
                                    cleanContent
                            );

                    StringBuilder completeResponse =
                            new StringBuilder();

                    return openRouterService
                            .streamResponse(
                                    aiPrompt
                            )
                            .doOnNext(
                                    completeResponse::append
                            )
                            .doOnComplete(
                                    () -> {
                                        if (
                                                completeResponse
                                                        .isEmpty()
                                        ) {
                                            return;
                                        }

                                        messageRepository.save(
                                                new Message(
                                                        completeResponse
                                                                .toString(),
                                                        "ASSISTANT",
                                                        conversation
                                                )
                                        );

                                        updateConversationTime(
                                                conversation
                                        );
                                    }
                            );
                }
        );
    }

    public List<MessageResponse> getMessages(
            Long conversationId,
            String email
    ) {
        Conversation conversation =
                getOwnedConversation(
                        conversationId,
                        email
                );

        return messageRepository
                .findByConversationOrderByCreatedAtAsc(
                        conversation
                )
                .stream()
                .map(this::toMessageResponse)
                .toList();
    }

    @Transactional
    public void deleteConversation(
            Long conversationId,
            String email
    ) {
        Conversation conversation =
                getOwnedConversation(
                        conversationId,
                        email
                );

        messageRepository.deleteByConversation(
                conversation
        );

        conversationRepository.delete(
                conversation
        );
    }

    @Transactional
    public ConversationResponse attachDocument(
            Long conversationId,
            Long documentId,
            String email
    ) {
        if (documentId == null) {
            throw new RuntimeException(
                    "Document ID is required"
            );
        }

        Conversation conversation =
                getOwnedConversation(
                        conversationId,
                        email
                );

        User user =
                getUserByEmail(email);

        Document document =
                documentRepository
                        .findByIdAndUser(
                                documentId,
                                user
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Document not found or access denied"
                                        )
                        );

        conversation.setDocument(
                document
        );

        conversation.setUpdatedAt(
                LocalDateTime.now()
        );

        Conversation savedConversation =
                conversationRepository.save(
                        conversation
                );

        return toConversationResponse(
                savedConversation
        );
    }

    @Transactional
    public ConversationResponse detachDocument(
            Long conversationId,
            String email
    ) {
        Conversation conversation =
                getOwnedConversation(
                        conversationId,
                        email
                );

        conversation.setDocument(
                null
        );

        conversation.setUpdatedAt(
                LocalDateTime.now()
        );

        Conversation savedConversation =
                conversationRepository.save(
                        conversation
                );

        return toConversationResponse(
                savedConversation
        );
    }

    private int findMessageIndex(
            List<Message> messages,
            Long messageId
    ) {
        for (
                int index = 0;
                index < messages.size();
                index++
        ) {
            Message currentMessage =
                    messages.get(index);

            if (
                    currentMessage.getId() != null &&
                    currentMessage.getId()
                            .equals(messageId)
            ) {
                return index;
            }
        }

        return -1;
    }

    private void validateMessageBelongsToConversation(
            Message message,
            Conversation conversation
    ) {
        if (
                message.getConversation() == null ||
                message.getConversation().getId() == null ||
                !message.getConversation()
                        .getId()
                        .equals(
                                conversation.getId()
                        )
        ) {
            throw new RuntimeException(
                    "Message does not belong to this conversation"
            );
        }
    }

    private String buildAiPrompt(
            Conversation conversation,
            String question
    ) {
        Document document =
                conversation.getDocument();

        if (document == null) {
            return question;
        }

        String context =
                ragService.buildContext(
                        document,
                        question
                );

        if (
                context == null ||
                context.isBlank()
        ) {
            return """
                    The user attached a document named "%s", but no readable relevant context was found.

                    Tell the user that the uploaded document does not contain enough readable information to answer the question.

                    Question:
                    %s
                    """
                    .formatted(
                            document.getFileName(),
                            question
                    );
        }

        return """
                Answer the question using only the document context below.

                Do not use outside knowledge.

                If the answer is not in the context, clearly say:
                "The uploaded document does not contain this information."

                Document:
                %s

                Context:
                --------------------
                %s
                --------------------

                Question:
                %s
                """
                .formatted(
                        document.getFileName(),
                        context,
                        question
                );
    }

    private void updateConversationTitleIfRequired(
            Conversation conversation,
            String firstMessage
    ) {
        String currentTitle =
                conversation.getTitle();

        boolean hasDefaultTitle =
                currentTitle == null ||
                currentTitle.isBlank() ||
                DEFAULT_TITLE.equalsIgnoreCase(
                        currentTitle.trim()
                );

        if (!hasDefaultTitle) {
            return;
        }

        conversation.setTitle(
                generateConversationTitle(
                        firstMessage
                )
        );

        conversation.setUpdatedAt(
                LocalDateTime.now()
        );

        conversationRepository.save(
                conversation
        );
    }

    private String generateConversationTitle(
            String message
    ) {
        String title =
                message
                        .replaceAll(
                                "\\s+",
                                " "
                        )
                        .trim();

        if (
                title.length() <=
                MAX_AUTO_TITLE_LENGTH
        ) {
            return title;
        }

        String shortenedTitle =
                title.substring(
                        0,
                        MAX_AUTO_TITLE_LENGTH
                )
                .trim();

        int finalSpaceIndex =
                shortenedTitle.lastIndexOf(
                        ' '
                );

        if (finalSpaceIndex > 20) {
            shortenedTitle =
                    shortenedTitle.substring(
                            0,
                            finalSpaceIndex
                    );
        }

        return shortenedTitle + "...";
    }

    private void validateMessageRequest(
            Long conversationId,
            String content
    ) {
        if (conversationId == null) {
            throw new RuntimeException(
                    "Conversation ID is required"
            );
        }

        if (
                content == null ||
                content.isBlank()
        ) {
            throw new RuntimeException(
                    "Message content cannot be empty"
            );
        }
    }

    private User getUserByEmail(
            String email
    ) {
        if (
                email == null ||
                email.isBlank()
        ) {
            throw new RuntimeException(
                    "Authenticated user email is required"
            );
        }

        return userRepository
                .findByEmail(email)
                .orElseThrow(
                        () ->
                                new RuntimeException(
                                        "User not found"
                                )
                );
    }

    private Conversation getOwnedConversation(
            Long conversationId,
            String email
    ) {
        if (conversationId == null) {
            throw new RuntimeException(
                    "Conversation ID is required"
            );
        }

        Conversation conversation =
                conversationRepository
                        .findById(
                                conversationId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Conversation not found"
                                        )
                        );

        if (
                !conversation
                        .getUser()
                        .getEmail()
                        .equalsIgnoreCase(
                                email
                        )
        ) {
            throw new RuntimeException(
                    "You do not have access to this conversation"
            );
        }

        return conversation;
    }

    private void updateConversationTime(
            Conversation conversation
    ) {
        conversation.setUpdatedAt(
                LocalDateTime.now()
        );

        conversationRepository.save(
                conversation
        );
    }

    private ConversationResponse toConversationResponse(
            Conversation conversation
    ) {
        Document document =
                conversation.getDocument();

        return new ConversationResponse(
                conversation.getId(),
                conversation.getTitle(),
                conversation.getCreatedAt(),
                conversation.getUpdatedAt(),
                document == null
                        ? null
                        : document.getId(),
                document == null
                        ? null
                        : document.getFileName()
        );
    }

    private MessageResponse toMessageResponse(
            Message message
    ) {
        return new MessageResponse(
                message.getId(),
                message.getContent(),
                message.getSender(),
                message.getCreatedAt()
        );
    }
}