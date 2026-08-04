"use strict";

/* ==========================================================
   AI PERSONAL ASSISTANT
   PROFESSIONAL DASHBOARD
========================================================== */

const Dashboard = {

   apiBaseUrl:
    "https://ai-personal-assistant-production-2cfc.up.railway.app",

token: null,
    currentUser: null,

    activeConversationId: null,

activeDocument: null,

conversations: [],

    messages: [],

    isGenerating: false,

    streamController: null,

    lastSubmittedPrompt: null,

editingMessageId: null,

selectedFeedbackRating: 0,

feedbackTimerStartedAt: null,

feedbackCheckInterval: null,

recognition: null,

    isListening: false,

    settings: {
        theme: "system",
        fontSize: "medium",
        autoSpeak: false
    },

    elements: {}
};


/* ==========================================================
   DOM ELEMENTS
========================================================== */

Dashboard.cacheElements = function () {

    this.elements = {

        sidebar:
            document.getElementById(
                "dashboardSidebar"
            ),

        sidebarOverlay:
            document.getElementById(
                "sidebarOverlay"
            ),

        openSidebarButton:
            document.getElementById(
                "openSidebarButton"
            ),

        closeSidebarButton:
            document.getElementById(
                "closeSidebarButton"
            ),

        newChatButton:
            document.getElementById(
                "newChatButton"
            ),

        refreshConversationsButton:
            document.getElementById(
                "refreshConversationsButton"
            ),

        conversationList:
            document.getElementById(
                "conversationList"
            ),

        conversationSearchInput:
            document.getElementById(
                "conversationSearchInput"
            ),

        userMenuButton:
            document.getElementById(
                "userMenuButton"
            ),

        userDropdown:
            document.getElementById(
                "userDropdown"
            ),

        profileButton:
            document.getElementById(
                "profileButton"
            ),

        settingsButton:
            document.getElementById(
                "settingsButton"
            ),

        logoutButton:
            document.getElementById(
                "logoutButton"
            ),

        sidebarUserName:
            document.getElementById(
                "sidebarUserName"
            ),

        sidebarUserEmail:
            document.getElementById(
                "sidebarUserEmail"
            ),

        userAvatar:
            document.getElementById(
                "userAvatar"
            ),

        welcomeUserName:
            document.getElementById(
                "welcomeUserName"
            ),

        welcomeState:
            document.getElementById(
                "welcomeState"
            ),

        activeConversationTitle:
            document.getElementById(
                "activeConversationTitle"
            ),

        connectionStatus:
            document.getElementById(
                "connectionStatus"
            ),

        chatMessages:
            document.getElementById(
                "chatMessages"
            ),

        typingIndicator:
            document.getElementById(
                "typingIndicator"
            ),

        chatForm:
            document.getElementById(
                "chatForm"
            ),

        messageInput:
            document.getElementById(
                "messageInput"
            ),

        sendButton:
            document.getElementById(
                "sendButton"
            ),

        stopButton:
            document.getElementById(
                "stopButton"
            ),

        uploadPdfButton:
            document.getElementById(
                "uploadPdfButton"
            ),

        pdfFileInput:
            document.getElementById(
                "pdfFileInput"
            ),

        pdfContextButton:
            document.getElementById(
                "pdfContextButton"
            ),

        selectedDocumentBanner:
            document.getElementById(
                "selectedDocumentBanner"
            ),

        selectedDocumentName:
            document.getElementById(
                "selectedDocumentName"
            ),

        removeDocumentContextButton:
            document.getElementById(
                "removeDocumentContextButton"
            ),

        voiceButton:
            document.getElementById(
                "voiceButton"
            ),

        themeButton:
            document.getElementById(
                "themeButton"
            ),

        settingsModal:
            document.getElementById(
                "settingsModal"
            ),

        closeSettingsButton:
            document.getElementById(
                "closeSettingsButton"
            ),

        themeSelect:
            document.getElementById(
                "themeSelect"
            ),

        fontSizeSelect:
            document.getElementById(
                "fontSizeSelect"
            ),

        autoSpeakToggle:
            document.getElementById(
                "autoSpeakToggle"
            ),

        resetSettingsButton:
            document.getElementById(
                "resetSettingsButton"
            ),

        saveSettingsButton:
            document.getElementById(
                "saveSettingsButton"
            ),

        toastContainer:
            document.getElementById(
                "toastContainer"
            ),

        loadingOverlay:
            document.getElementById(
                "loadingOverlay"
            ),
            profileModal:
    document.getElementById(
        "profileModal"
    ),

closeProfileButton:
    document.getElementById(
        "closeProfileButton"
    ),

closeProfileActionButton:
    document.getElementById(
        "closeProfileActionButton"
    ),

profileLogoutButton:
    document.getElementById(
        "profileLogoutButton"
    ),

profileAvatar:
    document.getElementById(
        "profileAvatar"
    ),

profileName:
    document.getElementById(
        "profileName"
    ),

profileEmail:
    document.getElementById(
        "profileEmail"
    ),

profileFullName:
    document.getElementById(
        "profileFullName"
    ),

profileEmailAddress:
    document.getElementById(
        "profileEmailAddress"
    ),
    feedbackModal:
    document.getElementById(
        "feedbackModal"
    ),

feedbackStars:
    document.getElementById(
        "feedbackStars"
    ),

experienceSelect:
    document.getElementById(
        "experienceSelect"
    ),

feedbackSuggestion:
    document.getElementById(
        "feedbackSuggestion"
    ),

feedbackBug:
    document.getElementById(
        "feedbackBug"
    ),

feedbackLaterButton:
    document.getElementById(
        "feedbackLaterButton"
    ),

submitFeedbackButton:
    document.getElementById(
        "submitFeedbackButton"
    ),

        loadingMessage:
            document.getElementById(
                "loadingMessage"
            )
    };
};


/* ==========================================================
   AUTHENTICATION
========================================================== */

Dashboard.loadAuthentication = function () {

    this.token =
        localStorage.getItem(
            "jwtToken"
        );

    if (!this.token) {

        window.location.replace(
            "login.html"
        );

        return false;
    }

    const savedUser =
        localStorage.getItem(
            "currentUser"
        );

    if (savedUser) {

        try {

            this.currentUser =
                JSON.parse(savedUser);

        } catch (error) {

            console.warn(
                "Invalid saved user data:",
                error
            );

            localStorage.removeItem(
                "currentUser"
            );
        }
    }

    return true;
};


Dashboard.getAuthHeaders = function (
    acceptType =
        "application/json"
) {

    return {
        "Content-Type":
            "application/json",

        "Accept":
            acceptType,

        "Authorization":
            `Bearer ${this.token}`
    };
};


Dashboard.handleExpiredSession = function () {

    localStorage.removeItem(
        "jwtToken"
    );

    localStorage.removeItem(
        "currentUser"
    );

    localStorage.removeItem(
        "activeConversationId"
    );

    window.alert(
        "Your session expired. Please sign in again."
    );

    window.location.replace(
        "login.html"
    );
};


/* ==========================================================
   API RESPONSE HELPERS
========================================================== */

Dashboard.readApiResponse = async function (
    response
) {

    if (
        response.status === 401 ||
        response.status === 403
    ) {

        this.handleExpiredSession();

        throw new Error(
            "Authentication failed."
        );
    }

    const contentType =
        response.headers.get(
            "content-type"
        ) || "";

    if (
        contentType.includes(
            "application/json"
        )
    ) {

        return await response.json();
    }

    return await response.text();
};


Dashboard.getApiErrorMessage = function (
    data,
    fallbackMessage
) {

    if (!data) {
        return fallbackMessage;
    }

    if (
        typeof data === "string"
    ) {

        return data ||
            fallbackMessage;
    }

    return (
        data.message ||
        data.error ||
        data.details ||
        fallbackMessage
    );
};


/* ==========================================================
   USER INFORMATION
========================================================== */

Dashboard.getDisplayName = function () {

    const storedName =
        this.currentUser?.name ||
        this.currentUser?.fullName ||
        this.currentUser?.username;

    if (
        storedName &&
        !storedName.includes("@")
    ) {

        return storedName;
    }

    const email =
        this.currentUser?.email ||
        storedName ||
        "User";

    if (!email.includes("@")) {
        return "User";
    }

    return email
        .split("@")[0]
        .replace(
            /[._-]+/g,
            " "
        )
        .replace(
            /\b\w/g,
            character =>
                character.toUpperCase()
        );
};


Dashboard.loadUserInformation = function () {

    const name =
        this.getDisplayName();

    const email =
        this.currentUser?.email ||
        "user@example.com";

    if (
        this.elements.sidebarUserName
    ) {

        this.elements
            .sidebarUserName
            .textContent =
            name;
    }

    if (
        this.elements.sidebarUserEmail
    ) {

        this.elements
            .sidebarUserEmail
            .textContent =
            email;
    }

    if (
        this.elements.welcomeUserName
    ) {

        this.elements
            .welcomeUserName
            .textContent =
            name;
    }

    if (
        this.elements.userAvatar
    ) {

        this.elements
            .userAvatar
            .textContent =
            name
                .charAt(0)
                .toUpperCase();
    }
};


/* ==========================================================
   SIDEBAR AND USER MENU
========================================================== */

Dashboard.openSidebar = function () {

    this.elements.sidebar
        ?.classList.add(
            "active"
        );

    this.elements.sidebarOverlay
        ?.classList.add(
            "active"
        );
};


Dashboard.closeSidebar = function () {

    this.elements.sidebar
        ?.classList.remove(
            "active"
        );

    this.elements.sidebarOverlay
        ?.classList.remove(
            "active"
        );
};


Dashboard.toggleUserDropdown = function () {

    if (
        !this.elements.userDropdown
    ) {

        return;
    }

    this.elements.userDropdown.hidden =
        !this.elements.userDropdown.hidden;
};


Dashboard.closeUserDropdown = function () {

    if (
        this.elements.userDropdown
    ) {

        this.elements.userDropdown.hidden =
            true;
    }
};


/* ==========================================================
   TOAST NOTIFICATIONS
========================================================== */

Dashboard.showToast = function (
    message,
    type = "info",
    duration = 3500
) {

    if (
        !message ||
        !this.elements.toastContainer
    ) {

        return;
    }

    const icons = {
        success: "✓",
        error: "!",
        warning: "⚠",
        info: "i"
    };

    const toast =
        document.createElement(
            "div"
        );

    toast.className =
        `toast toast-${type}`;

    const icon =
        document.createElement(
            "span"
        );

    icon.className =
        "toast-icon";

    icon.textContent =
        icons[type] || "i";

    const content =
        document.createElement(
            "div"
        );

    content.className =
        "toast-content";

    const messageElement =
        document.createElement(
            "p"
        );

    messageElement.className =
        "toast-message";

    messageElement.textContent =
        message;

    const closeButton =
        document.createElement(
            "button"
        );

    closeButton.type =
        "button";

    closeButton.className =
        "toast-close";

    closeButton.textContent =
        "×";

    closeButton.addEventListener(
        "click",
        () => toast.remove()
    );

    content.appendChild(
        messageElement
    );

    toast.append(
        icon,
        content,
        closeButton
    );

    this.elements
        .toastContainer
        .appendChild(
            toast
        );

    requestAnimationFrame(
        () => {

            toast.classList.add(
                "show"
            );
        }
    );

    window.setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

            toast.classList.add(
                "hide"
            );

            window.setTimeout(
                () => toast.remove(),
                250
            );

        },
        duration
    );
};


/* ==========================================================
   LOADING OVERLAY
========================================================== */

Dashboard.showLoading = function (
    message =
        "Loading..."
) {

    if (
        this.elements.loadingMessage
    ) {

        this.elements
            .loadingMessage
            .textContent =
            message;
    }

    if (
        this.elements.loadingOverlay
    ) {

        this.elements
            .loadingOverlay
            .hidden =
            false;
    }
};


Dashboard.hideLoading = function () {

    if (
        this.elements.loadingOverlay
    ) {

        this.elements
            .loadingOverlay
            .hidden =
            true;
    }
};


/* ==========================================================
   DATA NORMALIZATION
========================================================== */

Dashboard.normalizeConversation = function (
    conversation
) {

    return {
        id:
            conversation.id ??
            conversation.conversationId,

        title:
            conversation.title ||
            "New Conversation",

        createdAt:
            conversation.createdAt ||
            null,

        updatedAt:
            conversation.updatedAt ||
            conversation.createdAt ||
            null,

        documentId:
            conversation.documentId ??
            null,

        documentName:
            conversation.documentName ||
            null
    };
};


Dashboard.normalizeMessage = function (
    message
) {

    return {
        id:
            message.id ??
            message.messageId ??
            null,

        content:
            message.content ||
            message.message ||
            "",

        sender:
            String(
                message.sender ||
                message.role ||
                "ASSISTANT"
            ).toUpperCase(),

        createdAt:
            message.createdAt ||
            new Date().toISOString()
    };
};


/* ==========================================================
   CONVERSATION API
========================================================== */

Dashboard.loadConversations = async function () {

    try {

        const response =
            await fetch(
                `${this.apiBaseUrl}/conversations`,
                {
                    method: "GET",

                    headers:
                        this.getAuthHeaders()
                }
            );

        const data =
            await this.readApiResponse(
                response
            );

        if (!response.ok) {

            throw new Error(
                this.getApiErrorMessage(
                    data,
                    "Unable to load conversations."
                )
            );
        }

        this.conversations =
            Array.isArray(data)
                ? data.map(
                    item =>
                        this.normalizeConversation(
                            item
                        )
                )
                : [];

        this.renderConversationList();

    } catch (error) {

        console.error(
            "Conversation load error:",
            error
        );

        this.showToast(
            error.message,
            "error"
        );
    }
};


Dashboard.createConversation = async function (
    title =
        "New Conversation"
) {

    const response =
        await fetch(
            `${this.apiBaseUrl}/conversations`,
            {
                method: "POST",

                headers:
                    this.getAuthHeaders(),

                body:
                    JSON.stringify({
                        title
                    })
            }
        );

    const data =
        await this.readApiResponse(
            response
        );

    if (!response.ok) {

        throw new Error(
            this.getApiErrorMessage(
                data,
                "Unable to create conversation."
            )
        );
    }

    const conversation =
        this.normalizeConversation(
            data
        );

    this.activeConversationId =
        conversation.id;

    localStorage.setItem(
        "activeConversationId",
        String(conversation.id)
    );

    this.conversations.unshift(
        conversation
    );

    this.updateActiveConversationTitle(
        conversation.title
    );

    this.renderConversationList();

    return conversation;
};


Dashboard.renameConversation = async function (
    conversationId
) {

    const conversation =
        this.conversations.find(
            item =>
                String(item.id) ===
                String(conversationId)
        );

    if (!conversation) {
        return;
    }

    const newTitle =
        window.prompt(
            "Enter a new conversation title:",
            conversation.title
        );

    if (
        !newTitle ||
        !newTitle.trim()
    ) {

        return;
    }

    try {

        const response =
            await fetch(
                `${this.apiBaseUrl}/conversations/${conversationId}`,
                {
                    method: "PUT",

                    headers:
                        this.getAuthHeaders(),

                    body:
                        JSON.stringify({
                            title:
                                newTitle.trim()
                        })
                }
            );

        const data =
            await this.readApiResponse(
                response
            );

        if (!response.ok) {

            throw new Error(
                this.getApiErrorMessage(
                    data,
                    "Unable to rename conversation."
                )
            );
        }

        const updated =
            this.normalizeConversation(
                data
            );

        this.conversations =
            this.conversations.map(
                item =>
                    String(item.id) ===
                    String(conversationId)
                        ? updated
                        : item
            );

        if (
            String(
                this.activeConversationId
            ) ===
            String(conversationId)
        ) {

            this.updateActiveConversationTitle(
                updated.title
            );
        }

        this.renderConversationList();

        this.showToast(
            "Conversation renamed.",
            "success"
        );

    } catch (error) {

        this.showToast(
            error.message,
            "error"
        );
    }
};


Dashboard.deleteConversation = async function (
    conversationId
) {

    const confirmed =
        window.confirm(
            "Delete this conversation permanently?"
        );

    if (!confirmed) {
        return;
    }

    try {

        const response =
            await fetch(
                `${this.apiBaseUrl}/conversations/${conversationId}`,
                {
                    method: "DELETE",

                    headers:
                        this.getAuthHeaders()
                }
            );

        if (
            !response.ok &&
            response.status !== 204
        ) {

            const data =
                await this.readApiResponse(
                    response
                );

            throw new Error(
                this.getApiErrorMessage(
                    data,
                    "Unable to delete conversation."
                )
            );
        }

        this.conversations =
            this.conversations.filter(
                item =>
                    String(item.id) !==
                    String(conversationId)
            );

        if (
            String(
                this.activeConversationId
            ) ===
            String(conversationId)
        ) {

            this.startNewChat();
        }

        this.renderConversationList();

        this.showToast(
            "Conversation deleted.",
            "success"
        );

    } catch (error) {

        this.showToast(
            error.message,
            "error"
        );
    }
};


/* ==========================================================
   CONVERSATION LIST
========================================================== */

Dashboard.formatRelativeTime = function (
    value
) {

    if (!value) {
        return "";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";
    }

    const difference =
        Date.now() -
        date.getTime();

    const minutes =
        Math.floor(
            difference / 60000
        );

    if (minutes < 1) {
        return "Just now";
    }

    if (minutes < 60) {
        return `${minutes}m ago`;
    }

    const hours =
        Math.floor(
            minutes / 60
        );

    if (hours < 24) {
        return `${hours}h ago`;
    }

    const days =
        Math.floor(
            hours / 24
        );

    if (days < 7) {
        return `${days}d ago`;
    }

    return date.toLocaleDateString();
};


Dashboard.renderConversationList = function (
    filterText = ""
) {

    const container =
        this.elements.conversationList;

    if (!container) {
        return;
    }

    container.innerHTML = "";

    const search =
        filterText
            .trim()
            .toLowerCase();

    const filtered =
        this.conversations.filter(
            conversation =>
                conversation.title
                    .toLowerCase()
                    .includes(search)
        );

    if (!filtered.length) {

        const emptyState =
            document.createElement(
                "div"
            );

        emptyState.className =
            "conversation-empty-state";

        emptyState.innerHTML = `
            <span>💬</span>
            <p>
                ${
                    search
                        ? "No matching conversations."
                        : "No conversations yet."
                }
            </p>
            <small>
                ${
                    search
                        ? "Try another search."
                        : "Start a new chat to begin."
                }
            </small>
        `;

        container.appendChild(
            emptyState
        );

        return;
    }

    filtered.forEach(
        conversation => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "conversation-item";

            if (
                String(conversation.id) ===
                String(
                    this.activeConversationId
                )
            ) {

                item.classList.add(
                    "active"
                );
            }

            const mainButton =
                document.createElement(
                    "button"
                );

            mainButton.type =
                "button";

            mainButton.className =
                "conversation-main-button";

            const icon =
                document.createElement(
                    "span"
                );

            icon.className =
                "conversation-icon";

            icon.textContent =
                "💬";

            const details =
                document.createElement(
                    "span"
                );

            details.className =
                "conversation-details";

            const title =
                document.createElement(
                    "span"
                );

            title.className =
                "conversation-title";

            title.textContent =
                conversation.title;

            const time =
                document.createElement(
                    "span"
                );

            time.className =
                "conversation-time";

            time.textContent =
                this.formatRelativeTime(
                    conversation.updatedAt
                );

            details.append(
                title,
                time
            );

            mainButton.append(
                icon,
                details
            );

            mainButton.addEventListener(
                "click",
                () => {

                    this.openConversation(
                        conversation.id
                    );
                }
            );

            const actions =
                document.createElement(
                    "div"
                );

            actions.className =
                "conversation-actions";

            const renameButton =
                document.createElement(
                    "button"
                );

            renameButton.type =
                "button";

            renameButton.className =
                "conversation-action-button";

            renameButton.title =
                "Rename conversation";

            renameButton.textContent =
                "✏";

            renameButton.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    this.renameConversation(
                        conversation.id
                    );
                }
            );

            const deleteButton =
                document.createElement(
                    "button"
                );

            deleteButton.type =
                "button";

            deleteButton.className =
                "conversation-action-button delete";

            deleteButton.title =
                "Delete conversation";

            deleteButton.textContent =
                "🗑";

            deleteButton.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    this.deleteConversation(
                        conversation.id
                    );
                }
            );

            actions.append(
                renameButton,
                deleteButton
            );

            item.append(
                mainButton,
                actions
            );

            container.appendChild(
                item
            );
        }
    );
};


/* ==========================================================
   OPEN AND LOAD CONVERSATION
========================================================== */

Dashboard.openConversation = async function (
    conversationId
) {

    if (this.isGenerating) {
        return;
    }

    const conversation =
        this.conversations.find(
            item =>
                String(item.id) ===
                String(conversationId)
        );

    if (!conversation) {

        this.showToast(
            "Conversation could not be found.",
            "error"
        );

        return;
    }

    this.activeConversationId =
        conversation.id;

    localStorage.setItem(
        "activeConversationId",
        String(conversation.id)
    );

    this.updateActiveConversationTitle(
        conversation.title ||
        "Conversation"
    );

    this.restoreDocumentFromConversation(
        conversation
    );

    this.renderConversationList();

    this.closeSidebar();

    await this.loadMessages(
    this.activeConversationId
);

this.checkFeedbackEligibility();
};


Dashboard.loadMessages = async function (
    conversationId,
    showOverlay = true
) {

    try {

        if (showOverlay) {

            this.showLoading(
                "Loading conversation..."
            );
        }

        const response =
            await fetch(
                `${this.apiBaseUrl}/messages/${conversationId}`,
                {
                    method: "GET",

                    headers:
                        this.getAuthHeaders()
                }
            );

        const data =
            await this.readApiResponse(
                response
            );

        if (!response.ok) {

            throw new Error(
                this.getApiErrorMessage(
                    data,
                    "Unable to load messages."
                )
            );
        }

        this.messages =
            Array.isArray(data)
                ? data.map(
                    message =>
                        this.normalizeMessage(
                            message
                        )
                )
                : [];

        this.renderAllMessages();

    } catch (error) {

        this.showToast(
            error.message,
            "error"
        );

   } finally {

    if (showOverlay) {

        this.hideLoading();
    }
}
};


/* ==========================================================
   MARKDOWN AND CODE BLOCKS
========================================================== */

Dashboard.renderMarkdown = function (
    markdown
) {

    const source =
        markdown || "";

    if (
        typeof marked ===
        "undefined"
    ) {

        const temporary =
            document.createElement(
                "div"
            );

        temporary.textContent =
            source;

        return temporary.innerHTML;
    }

    const html =
        marked.parse(source);

    if (
        typeof DOMPurify !==
        "undefined"
    ) {

        return DOMPurify.sanitize(
            html
        );
    }

    return html;
};


Dashboard.copyText = async function (
    text
) {

    try {

        await navigator.clipboard.writeText(
            text
        );

        return true;

    } catch {

        const textarea =
            document.createElement(
                "textarea"
            );

        textarea.value =
            text;

        textarea.style.position =
            "fixed";

        textarea.style.opacity =
            "0";

        document.body.appendChild(
            textarea
        );

        textarea.select();

        document.execCommand(
            "copy"
        );

        textarea.remove();

        return true;
    }
};


Dashboard.enhanceCodeBlocks = function (
    container
) {

    const codeBlocks =
        container.querySelectorAll(
            "pre > code"
        );

    codeBlocks.forEach(
        code => {

            const pre =
                code.parentElement;

            if (
                !pre ||
                pre.dataset.enhanced ===
                "true"
            ) {

                return;
            }

            pre.dataset.enhanced =
                "true";

            const wrapper =
                document.createElement(
                    "div"
                );

            wrapper.className =
                "code-block-wrapper";

            const header =
                document.createElement(
                    "div"
                );

            header.className =
                "code-block-header";

            const language =
                document.createElement(
                    "span"
                );

            language.className =
                "code-language";

            const languageClass =
                Array.from(
                    code.classList
                ).find(
                    className =>
                        className.startsWith(
                            "language-"
                        )
                );

            language.textContent =
                languageClass
                    ? languageClass
                        .replace(
                            "language-",
                            ""
                        )
                        .toUpperCase()
                    : "CODE";

            const copyButton =
                document.createElement(
                    "button"
                );

            copyButton.type =
                "button";

            copyButton.className =
                "code-copy-button";

            copyButton.textContent =
                "Copy code";

            copyButton.addEventListener(
                "click",
                async () => {

                    await this.copyText(
                        code.textContent
                    );

                    copyButton.textContent =
                        "Copied";

                    this.showToast(
                        "Code copied to clipboard.",
                        "success"
                    );

                    window.setTimeout(
                        () => {

                            copyButton.textContent =
                                "Copy code";
                        },
                        1500
                    );
                }
            );

            header.append(
                language,
                copyButton
            );

            pre.parentNode.insertBefore(
                wrapper,
                pre
            );

            wrapper.append(
                header,
                pre
            );
        }
    );
};


/* ==========================================================
   MESSAGE RENDERING
========================================================== */

Dashboard.clearRenderedMessages = function () {

    this.elements.chatMessages
        ?.querySelectorAll(
            ".message-row"
        )
        .forEach(
            element =>
                element.remove()
        );
};


Dashboard.formatMessageTime = function (
    value
) {

    const date =
        value
            ? new Date(value)
            : new Date();

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";
    }

    return date.toLocaleTimeString(
        [],
        {
            hour:
                "2-digit",

            minute:
                "2-digit"
        }
    );
};
Dashboard.createUserMessageActions = function (
    message
) {

    const actions =
        document.createElement(
            "div"
        );

    actions.className =
        "message-actions user-message-actions";

    const editButton =
        document.createElement(
            "button"
        );

    editButton.type =
        "button";

    editButton.className =
        "message-action-button";

    editButton.textContent =
        "✏ Edit";

    editButton.disabled =
        !message.id;

    editButton.title =
        message.id
            ? "Edit message"
            : "Message is still being saved";

    editButton.addEventListener(
        "click",
        () => {

            this.beginEditingMessage(
                message
            );
        }
    );

    actions.appendChild(
        editButton
    );

    return actions;
};


Dashboard.beginEditingMessage = function (
    message
) {

    if (this.isGenerating) {

        this.showToast(
            "Please wait until the current response is complete.",
            "warning"
        );

        return;
    }

    if (!message?.id) {

        this.showToast(
            "Please wait a moment and try editing again.",
            "warning"
        );

        return;
    }

    this.editingMessageId =
        message.id;

    this.setMessageInputValue(
        message.content
    );

    if (this.elements.messageInput) {

        this.elements.messageInput.placeholder =
            "Edit your message...";
    }

    if (this.elements.sendButton) {

        this.elements.sendButton.title =
            "Save edited message";

        this.elements.sendButton.setAttribute(
            "aria-label",
            "Save edited message"
        );
    }

    this.showToast(
        "Edit the message and press Send to save it.",
        "info"
    );
};


Dashboard.cancelMessageEditing = function () {

    this.editingMessageId =
        null;

    this.clearMessageInput();

    if (this.elements.messageInput) {

        this.elements.messageInput.placeholder =
            "Message your AI assistant...";
    }

    if (this.elements.sendButton) {

        this.elements.sendButton.title =
            "Send message";

        this.elements.sendButton.setAttribute(
            "aria-label",
            "Send message"
        );
    }
};


Dashboard.updateExistingMessage =
async function (
    content
) {

    if (
        !this.activeConversationId ||
        !this.editingMessageId
    ) {

        throw new Error(
            "No message was selected for editing."
        );
    }

    const response =
        await fetch(
            `${this.apiBaseUrl}/conversations/${this.activeConversationId}/messages/${this.editingMessageId}`,
            {
                method: "PUT",

                headers:
                    this.getAuthHeaders(),

                body:
                    JSON.stringify({
                        content:
                            content.trim()
                    })
            }
        );

    const data =
        await this.readApiResponse(
            response
        );

    if (!response.ok) {

        throw new Error(
            this.getApiErrorMessage(
                data,
                "Unable to update the message."
            )
        );
    }

    return this.normalizeMessage(
        data
    );
};
Dashboard.createMessageActions = function (
    message
) {

    const actions =
        document.createElement(
            "div"
        );

    actions.className =
        "message-actions";

    const copyButton =
        document.createElement(
            "button"
        );

    copyButton.type =
        "button";

    copyButton.className =
        "message-action-button";

    copyButton.textContent =
        "📋 Copy response";

    copyButton.addEventListener(
        "click",
        async () => {

            await this.copyText(
                message.content
            );

            copyButton.textContent =
                "✓ Copied";

            this.showToast(
                "Response copied to clipboard.",
                "success"
            );

            window.setTimeout(
                () => {

                    copyButton.textContent =
                        "📋 Copy response";
                },
                1500
            );
        }
    );

    const regenerateButton =
        document.createElement(
            "button"
        );

    regenerateButton.type =
        "button";

    regenerateButton.className =
        "message-action-button";

    regenerateButton.textContent =
        "↻ Regenerate";

    regenerateButton.addEventListener(
        "click",
        () => {

            this.regenerateLastResponse();
        }
    );

    actions.append(
        copyButton,
        regenerateButton
    );

    return actions;
};


Dashboard.renderMessage = function (
    message,
    options = {}
) {

    const container =
        this.elements.chatMessages;

    if (!container) {
        return null;
    }

    if (
        this.elements.welcomeState
    ) {

        this.elements
            .welcomeState
            .hidden =
            true;
    }

    const isUser =
        message.sender === "USER";

    const row =
        document.createElement(
            "div"
        );

    row.className =
        `message-row ${
            isUser
                ? "user"
                : "assistant"
        }`;

    const bubble =
        document.createElement(
            "div"
        );

    bubble.className =
        "message-bubble";

    const content =
        document.createElement(
            "div"
        );

    content.className =
        "message-content";

    if (isUser) {

        content.textContent =
            message.content;

    } else {

        content.innerHTML =
            this.renderMarkdown(
                message.content
            );

        this.enhanceCodeBlocks(
            content
        );
    }

    bubble.appendChild(
        content
    );

    if (!options.streaming) {

    const meta =
        document.createElement(
            "div"
        );

    meta.className =
        "message-meta";

    meta.textContent =
        this.formatMessageTime(
            message.createdAt
        );

    bubble.appendChild(
        meta
    );

    if (isUser) {

        bubble.appendChild(
            this.createUserMessageActions(
                message
            )
        );

    } else {

        bubble.appendChild(
            this.createMessageActions(
                message
            )
        );
    }
}

row.appendChild(
    bubble
);

container.appendChild(
    row
);

    this.scrollToBottom();

    return {
        row,
        bubble,
        content
    };
};


Dashboard.renderAllMessages = function () {

    this.clearRenderedMessages();

    if (
        this.elements.welcomeState
    ) {

        this.elements
            .welcomeState
            .hidden =
            this.messages.length > 0;
    }

    this.messages.forEach(
        message => {

            this.renderMessage(
                message
            );
        }
    );

    this.scrollToBottom();
};


/* ==========================================================
   NEW CHAT
========================================================== */

Dashboard.startNewChat = function () {

    if (this.isGenerating) {
        return;
    }

    this.activeConversationId =
        null;

    this.messages =
        [];

    this.lastSubmittedPrompt =
    null;

this.editingMessageId =
    null;
        this.clearActiveDocumentDisplay();

if (
    this.elements.pdfFileInput
) {

    this.elements
        .pdfFileInput
        .value =
        "";
}

    localStorage.removeItem(
        "activeConversationId"
    );

    this.clearRenderedMessages();

    if (
        this.elements.welcomeState
    ) {

        this.elements
            .welcomeState
            .hidden =
            false;
    }

    this.updateActiveConversationTitle(
        "New Conversation"
    );

    this.clearMessageInput();

    this.renderConversationList();

    this.closeSidebar();

    this.closeUserDropdown();

    this.elements.messageInput
        ?.focus();
};


/* ==========================================================
   MESSAGE INPUT
========================================================== */

Dashboard.updateSendButtonState = function () {

    if (
        !this.elements.messageInput ||
        !this.elements.sendButton
    ) {

        return;
    }

    const hasMessage =
        this.elements
            .messageInput
            .value
            .trim()
            .length > 0;

    this.elements.sendButton.disabled =
        !hasMessage ||
        this.isGenerating;
};


Dashboard.autoResizeMessageInput = function () {

    const input =
        this.elements.messageInput;

    if (!input) {
        return;
    }

    input.style.height =
        "auto";

    input.style.height =
        `${Math.min(
            input.scrollHeight,
            170
        )}px`;
};


Dashboard.setMessageInputValue = function (
    value
) {

    const input =
        this.elements.messageInput;

    if (!input) {
        return;
    }

    input.value =
        value || "";

    this.autoResizeMessageInput();

    this.updateSendButtonState();

    input.focus();
};


Dashboard.clearMessageInput = function () {

    const input =
        this.elements.messageInput;

    if (!input) {
        return;
    }

    input.value = "";

    input.style.height =
        "auto";

    this.updateSendButtonState();
};


Dashboard.handleMessageKeydown = function (
    event
) {

    if (
        event.key !== "Enter" ||
        event.shiftKey
    ) {

        return;
    }

    event.preventDefault();

    const message =
        this.elements.messageInput
            ?.value
            .trim();

    if (
        !message ||
        this.isGenerating
    ) {

        return;
    }

    this.elements.chatForm
        ?.requestSubmit();
};


/* ==========================================================
   GENERATING STATE
========================================================== */

Dashboard.setGeneratingState = function (
    generating
) {

    this.isGenerating =
        generating;

    if (
        this.elements.sendButton
    ) {

        this.elements
            .sendButton
            .hidden =
            generating;
    }

    if (
        this.elements.stopButton
    ) {

        this.elements
            .stopButton
            .hidden =
            !generating;
    }

    if (
        this.elements.messageInput
    ) {

        this.elements
            .messageInput
            .disabled =
            generating;
    }

    this.updateSendButtonState();
};


Dashboard.showTypingIndicator = function () {

    if (
        this.elements.typingIndicator
    ) {

        this.elements
            .typingIndicator
            .hidden =
            false;
    }
};


Dashboard.hideTypingIndicator = function () {

    if (
        this.elements.typingIndicator
    ) {

        this.elements
            .typingIndicator
            .hidden =
            true;
    }
};


Dashboard.stopGeneration = function () {

    this.streamController?.abort();
};


/* ==========================================================
   SSE PARSING
========================================================== */

Dashboard.extractSseEvents = function (
    buffer
) {

    const normalized =
        buffer.replace(
            /\r\n/g,
            "\n"
        );

    const blocks =
        normalized.split(
            "\n\n"
        );

    const remaining =
        blocks.pop() || "";

    const events =
        blocks
            .map(
                block => {

                    const dataLines =
                        block
                            .split("\n")
                            .filter(
                                line =>
                                    line.startsWith(
                                        "data:"
                                    )
                            )
                            .map(
                                line =>
                                    line.slice(5)
                            );

                    if (
                        !dataLines.length
                    ) {

                        return null;
                    }

                    return dataLines.join(
                        "\n"
                    );
                }
            )
            .filter(Boolean);

    return {
        events,
        remaining
    };
};


Dashboard.extractStreamText = function (
    eventData
) {

    if (!eventData) {
        return "";
    }

    const cleanData =
        eventData.startsWith(" ")
            ? eventData.substring(1)
            : eventData;

    if (
        cleanData.trim() ===
        "[DONE]"
    ) {

        return "";
    }

    try {

        const parsed =
            JSON.parse(
                cleanData
            );

        return (
            parsed.content ??
            parsed.text ??
            parsed.token ??
            parsed.delta ??
            parsed.message ??
            ""
        );

    } catch {

        return cleanData;
    }
};


/* ==========================================================
   SEND MESSAGE
========================================================== */

Dashboard.handleChatSubmit = async function (
    event
) {

    event.preventDefault();

    const message =
        this.elements
            .messageInput
            ?.value
            .trim();

    if (
        !message ||
        this.isGenerating
    ) {

        return;
    }

  if (
    this.editingMessageId
) {

    try {

        await this.updateExistingMessage(
            message
        );

        this.cancelMessageEditing();

       await this.loadMessages(
    this.activeConversationId,
    false
);

        this.showToast(
            "Message updated successfully.",
            "success"
        );

    } catch (error) {

        console.error(
            "Message update error:",
            error
        );

        this.showToast(
            error.message ||
            "Unable to update the message.",
            "error"
        );
    }

    return;
}

this.lastSubmittedPrompt =
    message;

this.clearMessageInput();

try {

        if (
            !this.activeConversationId
        ) {

            await this.createConversation();
        }

        const userMessage = {
            id: null,

            content:
                message,

            sender:
                "USER",

            createdAt:
                new Date()
                    .toISOString()
        };

        this.messages.push(
            userMessage
        );

        this.renderMessage(
            userMessage
        );

        await this.streamAiResponse(
            message
        );

    } catch (error) {

        console.error(
            "Chat submission error:",
            error
        );

        this.showToast(
            error.message ||
            "Unable to generate a response.",
            "error"
        );
    }
};


Dashboard.streamAiResponse = async function (
    prompt
) {

    this.setGeneratingState(
        true
    );

    this.showTypingIndicator();

    this.streamController =
        new AbortController();

    let renderedAssistant =
        null;

    let assistantMessage =
        null;

    try {

        const response =
            await fetch(
                `${this.apiBaseUrl}/chat/stream`,
                {
                    method: "POST",

                    headers:
                        this.getAuthHeaders(
                            "text/event-stream"
                        ),

                    body:
                        JSON.stringify({
                            conversationId:
                                this.activeConversationId,

                            content:
                                prompt
                        }),

                    signal:
                        this.streamController.signal
                }
            );

        if (
            response.status === 401 ||
            response.status === 403
        ) {

            this.handleExpiredSession();

            return;
        }

        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                errorText ||
                "Unable to receive an AI response."
            );
        }

        if (!response.body) {

            throw new Error(
                "Streaming is not supported by this browser."
            );
        }

        this.hideTypingIndicator();

        assistantMessage = {
            id: null,

            content: "",

            sender:
                "ASSISTANT",

            createdAt:
                new Date()
                    .toISOString()
        };

        renderedAssistant =
            this.renderMessage(
                assistantMessage,
                {
                    streaming: true
                }
            );

        const reader =
            response.body.getReader();

        const decoder =
            new TextDecoder(
                "utf-8"
            );

        let buffer = "";
        let completeResponse = "";

        while (true) {

            const result =
                await reader.read();

            if (result.done) {
                break;
            }

            buffer +=
                decoder.decode(
                    result.value,
                    {
                        stream: true
                    }
                );

            const parsed =
                this.extractSseEvents(
                    buffer
                );

            buffer =
                parsed.remaining;

            parsed.events.forEach(
                eventData => {

                    const chunk =
                        this.extractStreamText(
                            eventData
                        );

                    if (!chunk) {
                        return;
                    }

                    completeResponse +=
                        chunk;

                    renderedAssistant
                        .content
                        .innerHTML =
                        this.renderMarkdown(
                            completeResponse
                        );

                    const cursor =
                        document.createElement(
                            "span"
                        );

                    cursor.className =
                        "streaming-cursor";

                    renderedAssistant
                        .content
                        .appendChild(
                            cursor
                        );

                    this.scrollToBottom();
                }
            );
        }

        const finalBuffer =
            buffer.trim();

        if (finalBuffer) {

            const finalEvent =
                finalBuffer
                    .replace(
                        /^data:/,
                        ""
                    );

            completeResponse +=
                this.extractStreamText(
                    finalEvent
                );
        }

        if (
            !completeResponse.trim()
        ) {

            throw new Error(
                "The AI returned an empty response."
            );
        }

        assistantMessage.content =
            completeResponse;

        this.messages.push(
            assistantMessage
        );

        renderedAssistant
            .content
            .innerHTML =
            this.renderMarkdown(
                completeResponse
            );

        this.enhanceCodeBlocks(
            renderedAssistant.content
        );

        const meta =
            document.createElement(
                "div"
            );

        meta.className =
            "message-meta";

        meta.textContent =
            this.formatMessageTime(
                assistantMessage.createdAt
            );

        renderedAssistant
            .bubble
            .appendChild(
                meta
            );

        renderedAssistant
            .bubble
            .appendChild(
                this.createMessageActions(
                    assistantMessage
                )
            );

        if (
            this.settings.autoSpeak
        ) {

            this.speakText(
                completeResponse
            );
        }

        await this.loadConversations();

await this.loadMessages(
    this.activeConversationId
);

const updatedConversation =
            this.conversations.find(
                conversation =>
                    String(conversation.id) ===
                    String(
                        this.activeConversationId
                    )
            );

        if (updatedConversation) {

            this.updateActiveConversationTitle(
                updatedConversation.title
            );
        }

    } catch (error) {

        this.hideTypingIndicator();

        if (
            error.name ===
            "AbortError"
        ) {

            this.showToast(
                "Response generation stopped.",
                "info"
            );

            renderedAssistant
                ?.row
                ?.remove();

        } else {

            console.error(
                "Streaming error:",
                error
            );

            renderedAssistant
                ?.row
                ?.remove();

            this.showToast(
                error.message ||
                "Unable to generate a response.",
                "error"
            );
        }

    } finally {

        this.streamController =
            null;

        this.setGeneratingState(
            false
        );

        this.hideTypingIndicator();

        this.elements.messageInput
            ?.focus();
    }
};


/* ==========================================================
   REGENERATE RESPONSE
========================================================== */

Dashboard.regenerateLastResponse = async function () {

    if (
        this.isGenerating
    ) {

        return;
    }

    const lastUserMessage =
        [...this.messages]
            .reverse()
            .find(
                message =>
                    message.sender ===
                    "USER"
            );

    if (!lastUserMessage) {

        this.showToast(
            "No previous prompt is available.",
            "warning"
        );

        return;
    }

    const confirmed =
        window.confirm(
            "Generate a new response for the last prompt?"
        );

    if (!confirmed) {
        return;
    }

    await this.streamAiResponse(
        lastUserMessage.content
    );
};


/* ==========================================================
   SCROLLING AND TITLE
========================================================== */

Dashboard.scrollToBottom = function () {

    const container =
        this.elements.chatMessages;

    if (!container) {
        return;
    }

    container.scrollTop =
        container.scrollHeight;
};


Dashboard.updateActiveConversationTitle = function (
    title
) {

    if (
        this.elements.activeConversationTitle
    ) {

        this.elements
            .activeConversationTitle
            .textContent =
            title ||
            "New Conversation";
    }
};


/* ==========================================================
   VOICE INPUT AND OUTPUT
========================================================== */

Dashboard.initializeVoice = function () {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

        if (
            this.elements.voiceButton
        ) {

            this.elements
                .voiceButton
                .disabled =
                true;

            this.elements
                .voiceButton
                .title =
                "Voice input is not supported";
        }

        return;
    }

    this.recognition =
        new SpeechRecognition();

    this.recognition.lang =
        "en-US";

    this.recognition.continuous =
        false;

    this.recognition.interimResults =
        true;

    this.recognition.onstart =
        () => {

            this.isListening =
                true;

            this.elements.voiceButton
                ?.classList.add(
                    "listening"
                );

            this.showToast(
                "Listening...",
                "info"
            );
        };

    this.recognition.onresult =
        event => {

            let transcript = "";

            for (
                let index =
                    event.resultIndex;
                index <
                    event.results.length;
                index += 1
            ) {

                transcript +=
                    event
                        .results[index][0]
                        .transcript;
            }

            this.setMessageInputValue(
                transcript.trim()
            );
        };

    this.recognition.onend =
        () => {

            this.isListening =
                false;

            this.elements.voiceButton
                ?.classList.remove(
                    "listening"
                );
        };

    this.recognition.onerror =
        event => {

            this.showToast(
                `Voice input error: ${event.error}`,
                "error"
            );
        };
};


Dashboard.toggleVoiceInput = function () {

    if (!this.recognition) {

        this.showToast(
            "Voice input is not supported.",
            "warning"
        );

        return;
    }

    if (this.isListening) {

        this.recognition.stop();

    } else {

        try {

            this.recognition.start();

        } catch (error) {

            console.warn(
                "Voice recognition error:",
                error
            );
        }
    }
};


Dashboard.speakText = function (
    text
) {

    if (
        !text ||
        !(
            "speechSynthesis" in
            window
        )
    ) {

        return;
    }

    window.speechSynthesis.cancel();

    const cleanText =
        String(text)
            .replace(
                /```[\s\S]*?```/g,
                " Code example omitted. "
            )
            .replace(
                /[`*_#>]/g,
                ""
            )
            .replace(
                /\s+/g,
                " "
            )
            .trim();

    const speech =
        new SpeechSynthesisUtterance(
            cleanText
        );

    speech.lang =
        "en-US";

    window.speechSynthesis.speak(
        speech
    );
};


/* ==========================================================
   PDF UPLOAD AND RAG CONTEXT
========================================================== */

Dashboard.setActiveDocument = function (
    documentData
) {

    this.activeDocument = {
        id:
            documentData.id ??
            documentData.documentId,

        fileName:
            documentData.fileName ||
            documentData.documentName ||
            "document.pdf"
    };

    if (
        this.elements.selectedDocumentName
    ) {

        this.elements
            .selectedDocumentName
            .textContent =
            this.activeDocument.fileName;
    }

    if (
        this.elements.selectedDocumentBanner
    ) {

        this.elements
            .selectedDocumentBanner
            .hidden =
            false;
    }

    this.elements.pdfContextButton
        ?.classList.add(
            "active"
        );
};


Dashboard.clearActiveDocumentDisplay = function () {

    this.activeDocument =
        null;

    if (
        this.elements.selectedDocumentName
    ) {

        this.elements
            .selectedDocumentName
            .textContent =
            "";
    }

    if (
        this.elements.selectedDocumentBanner
    ) {

        this.elements
            .selectedDocumentBanner
            .hidden =
            true;
    }

    this.elements.pdfContextButton
        ?.classList.remove(
            "active"
        );
};
Dashboard.restoreDocumentFromConversation = function (
    conversation
) {

    if (
        conversation?.documentId
    ) {

        this.setActiveDocument({
            id:
                conversation.documentId,

            fileName:
                conversation.documentName ||
                "document.pdf"
        });

        return;
    }

    this.clearActiveDocumentDisplay();
};


Dashboard.uploadPdfDocument = async function (
    file
) {

    const formData =
        new FormData();

    formData.append(
        "file",
        file
    );

    const response =
        await fetch(
            `${this.apiBaseUrl}/documents/upload`,
            {
                method:
                    "POST",

                headers: {
                    "Accept":
                        "application/json",

                    "Authorization":
                        `Bearer ${this.token}`
                },

                body:
                    formData
            }
        );

    const data =
        await this.readApiResponse(
            response
        );

    if (!response.ok) {

        throw new Error(
            this.getApiErrorMessage(
                data,
                "Unable to upload the PDF."
            )
        );
    }

    return data;
};


Dashboard.attachDocumentToConversation =
async function (
    documentData
) {

    if (
        !this.activeConversationId
    ) {

        await this.createConversation();
    }

    const documentId =
        documentData.id ??
        documentData.documentId;

    if (!documentId) {

        throw new Error(
            "The backend did not return a document ID."
        );
    }

    const response =
        await fetch(
            `${this.apiBaseUrl}/conversations/${this.activeConversationId}/attach/${documentId}`,
            {
                method:
                    "POST",

                headers:
                    this.getAuthHeaders()
            }
        );

    const data =
        await this.readApiResponse(
            response
        );

    if (!response.ok) {

        throw new Error(
            this.getApiErrorMessage(
                data,
                "Unable to attach the PDF to this conversation."
            )
        );
    }

    const updatedConversation =
        this.normalizeConversation(
            data
        );

    this.conversations =
        this.conversations.map(
            conversation =>
                String(conversation.id) ===
                String(updatedConversation.id)
                    ? updatedConversation
                    : conversation
        );

    this.setActiveDocument({
        id:
            updatedConversation.documentId ||
            documentId,

        fileName:
            updatedConversation.documentName ||
            documentData.fileName ||
            "document.pdf"
    });

    this.renderConversationList();

    return updatedConversation;
};


Dashboard.handlePdfSelection =
async function (
    file
) {

    if (!file) {
        return;
    }

    const isPdf =
        file.type ===
        "application/pdf" ||
        file.name
            .toLowerCase()
            .endsWith(
                ".pdf"
            );

    if (!isPdf) {

        this.showToast(
            "Please select a valid PDF file.",
            "error"
        );

        if (
            this.elements.pdfFileInput
        ) {

            this.elements
                .pdfFileInput
                .value =
                "";
        }

        return;
    }

    if (
        file.size >
        10 * 1024 * 1024
    ) {

        this.showToast(
            "PDF file size must not exceed 10 MB.",
            "error"
        );

        if (
            this.elements.pdfFileInput
        ) {

            this.elements
                .pdfFileInput
                .value =
                "";
        }

        return;
    }

    try {

        this.showLoading(
            "Uploading and processing PDF..."
        );

        const uploadedDocument =
            await this.uploadPdfDocument(
                file
            );

        await this.attachDocumentToConversation(
            uploadedDocument
        );

        this.showToast(
            `${
                uploadedDocument.fileName ||
                file.name
            } is ready for questions.`,
            "success",
            5000
        );

    } catch (error) {

        console.error(
            "PDF upload error:",
            error
        );

        this.clearActiveDocumentDisplay();

        if (
            this.elements.pdfFileInput
        ) {

            this.elements
                .pdfFileInput
                .value =
                "";
        }

        this.showToast(
            error.message ||
            "Unable to process the PDF.",
            "error",
            5000
        );

    } finally {

        this.hideLoading();
    }
};


Dashboard.removePdfContext =
async function () {

    if (
        !this.activeConversationId
    ) {

        this.clearActiveDocumentDisplay();

        return;
    }

    try {

        const response =
            await fetch(
                `${this.apiBaseUrl}/conversations/${this.activeConversationId}/detach`,
                {
                    method:
                        "DELETE",

                    headers:
                        this.getAuthHeaders()
                }
            );

        const data =
            await this.readApiResponse(
                response
            );

        if (!response.ok) {

            throw new Error(
                this.getApiErrorMessage(
                    data,
                    "Unable to remove PDF context."
                )
            );
        }

        const updatedConversation =
            this.normalizeConversation(
                data
            );

        this.conversations =
            this.conversations.map(
                conversation =>
                    String(conversation.id) ===
                    String(updatedConversation.id)
                        ? updatedConversation
                        : conversation
            );

        this.clearActiveDocumentDisplay();

        if (
            this.elements.pdfFileInput
        ) {

            this.elements
                .pdfFileInput
                .value =
                "";
        }

        this.renderConversationList();

        this.showToast(
            "PDF context removed.",
            "success"
        );

    } catch (error) {

        this.showToast(
            error.message ||
            "Unable to remove PDF context.",
            "error"
        );
    }
};
/* ==========================================================
   FEEDBACK SYSTEM
========================================================== */

Dashboard.getFeedbackStorageKey = function () {

    const email =
        this.currentUser?.email ||
        "anonymous";

    return `feedbackSubmitted:${email}`;
};


Dashboard.hasSubmittedFeedback = function () {

    return localStorage.getItem(
        this.getFeedbackStorageKey()
    ) === "true";
};


Dashboard.getUserMessageCount = function () {

    return this.messages.filter(
        message =>
            message.sender === "USER"
    ).length;
};


Dashboard.updateFeedbackStars = function (
    rating
) {

    this.selectedFeedbackRating =
        rating;

    const stars =
        this.elements.feedbackStars
            ?.querySelectorAll(
                "[data-rating]"
            ) || [];

    stars.forEach(
        star => {

            const starRating =
                Number(
                    star.dataset.rating
                );

            const active =
                starRating <= rating;

            star.classList.toggle(
                "active",
                active
            );

            star.textContent =
                active
                    ? "★"
                    : "☆";
        }
    );
};


Dashboard.openFeedbackModal = function () {

    if (
        this.hasSubmittedFeedback() ||
        !this.elements.feedbackModal
    ) {

        return;
    }

    this.elements.feedbackModal.hidden =
        false;

    this.elements.feedbackModal.setAttribute(
        "aria-hidden",
        "false"
    );
};


Dashboard.closeFeedbackModal = function () {

    if (!this.elements.feedbackModal) {
        return;
    }

    this.elements.feedbackModal.hidden =
        true;

    this.elements.feedbackModal.setAttribute(
        "aria-hidden",
        "true"
    );
};


Dashboard.resetFeedbackForm = function () {

    this.updateFeedbackStars(
        0
    );

    if (
        this.elements.experienceSelect
    ) {

        this.elements.experienceSelect.value =
            "";
    }

    if (
        this.elements.feedbackSuggestion
    ) {

        this.elements.feedbackSuggestion.value =
            "";
    }

    if (
        this.elements.feedbackBug
    ) {

        this.elements.feedbackBug.value =
            "";
    }
};


Dashboard.shouldShowFeedback = function () {

    if (
        this.hasSubmittedFeedback() ||
        !this.feedbackTimerStartedAt
    ) {

        return false;
    }

    const fiveMinutes =
        5 * 60 * 1000;

    const hasUsedAppLongEnough =
        Date.now() -
        this.feedbackTimerStartedAt >=
        fiveMinutes;

    const hasEnoughMessages =
        this.getUserMessageCount() >= 10;

    return (
        hasUsedAppLongEnough &&
        hasEnoughMessages
    );
};


Dashboard.checkFeedbackEligibility = function () {

    if (
        this.shouldShowFeedback()
    ) {

        this.openFeedbackModal();

        if (
            this.feedbackCheckInterval
        ) {

            clearInterval(
                this.feedbackCheckInterval
            );

            this.feedbackCheckInterval =
                null;
        }
    }
};


Dashboard.startFeedbackTracking = function () {

    if (
        this.hasSubmittedFeedback()
    ) {

        return;
    }

    this.feedbackTimerStartedAt =
        Date.now();

    if (
        this.feedbackCheckInterval
    ) {

        clearInterval(
            this.feedbackCheckInterval
        );
    }

    this.feedbackCheckInterval =
        window.setInterval(
            () => {

                this.checkFeedbackEligibility();

            },
            30000
        );
};


Dashboard.submitFeedback = async function () {

    const rating =
        this.selectedFeedbackRating;

    const experience =
        this.elements.experienceSelect
            ?.value
            .trim();

    const suggestion =
        this.elements.feedbackSuggestion
            ?.value
            .trim() || "";

    const bugReport =
        this.elements.feedbackBug
            ?.value
            .trim() || "";

    if (
        rating < 1 ||
        rating > 5
    ) {

        this.showToast(
            "Please select a star rating.",
            "warning"
        );

        return;
    }

    if (!experience) {

        this.showToast(
            "Please select your overall experience.",
            "warning"
        );

        return;
    }

    try {

        if (
            this.elements.submitFeedbackButton
        ) {

            this.elements.submitFeedbackButton.disabled =
                true;

            this.elements.submitFeedbackButton.textContent =
                "Submitting...";
        }

        const response =
            await fetch(
                `${this.apiBaseUrl}/feedback`,
                {
                    method:
                        "POST",

                    headers:
                        this.getAuthHeaders(),

                    body:
                        JSON.stringify({
                            rating,
                            experience,
                            suggestion,
                            bugReport
                        })
                }
            );

        const data =
            await this.readApiResponse(
                response
            );

        if (!response.ok) {

            throw new Error(
                this.getApiErrorMessage(
                    data,
                    "Unable to submit feedback."
                )
            );
        }

        localStorage.setItem(
            this.getFeedbackStorageKey(),
            "true"
        );

        this.closeFeedbackModal();

        this.resetFeedbackForm();

        if (
            this.feedbackCheckInterval
        ) {

            clearInterval(
                this.feedbackCheckInterval
            );

            this.feedbackCheckInterval =
                null;
        }

        this.showToast(
            "Thank you for sharing your feedback!",
            "success",
            5000
        );

    } catch (error) {

        console.error(
            "Feedback submission error:",
            error
        );

        this.showToast(
            error.message ||
            "Unable to submit feedback.",
            "error",
            5000
        );

    } finally {

        if (
            this.elements.submitFeedbackButton
        ) {

            this.elements.submitFeedbackButton.disabled =
                false;

            this.elements.submitFeedbackButton.textContent =
                "Submit Feedback";
        }
    }
};
/* ==========================================================
   PROFILE
========================================================== */

Dashboard.populateProfile = function () {

    const name =
        this.getDisplayName();

    const email =
        this.currentUser?.email ||
        "user@example.com";

    if (
        this.elements.profileAvatar
    ) {

        this.elements
            .profileAvatar
            .textContent =
            name
                .charAt(0)
                .toUpperCase();
    }

    if (
        this.elements.profileName
    ) {

        this.elements
            .profileName
            .textContent =
            name;
    }

    if (
        this.elements.profileEmail
    ) {

        this.elements
            .profileEmail
            .textContent =
            email;
    }

    if (
        this.elements.profileFullName
    ) {

        this.elements
            .profileFullName
            .textContent =
            name;
    }

    if (
        this.elements.profileEmailAddress
    ) {

        this.elements
            .profileEmailAddress
            .textContent =
            email;
    }
};


Dashboard.openProfile = function () {

    this.closeUserDropdown();

    this.populateProfile();

    if (
        this.elements.profileModal
    ) {

        this.elements
            .profileModal
            .hidden =
            false;

        this.elements
            .profileModal
            .setAttribute(
                "aria-hidden",
                "false"
            );
    }
};


Dashboard.closeProfile = function () {

    if (
        this.elements.profileModal
    ) {

        this.elements
            .profileModal
            .hidden =
            true;

        this.elements
            .profileModal
            .setAttribute(
                "aria-hidden",
                "true"
            );
    }
};

/* ==========================================================
   SETTINGS AND THEME
========================================================== */

Dashboard.loadSettings = function () {

    const savedSettings =
        localStorage.getItem(
            "dashboardSettings"
        );

    if (savedSettings) {

        try {

            this.settings = {
                ...this.settings,
                ...JSON.parse(
                    savedSettings
                )
            };

        } catch (error) {

            console.warn(
                "Unable to read settings:",
                error
            );
        }
    }

    this.applySettings();
};


Dashboard.getSystemTheme = function () {

    return window.matchMedia(
        "(prefers-color-scheme: dark)"
    ).matches
        ? "dark"
        : "light";
};


Dashboard.applySettings = function () {

    const resolvedTheme =
        this.settings.theme ===
        "system"
            ? this.getSystemTheme()
            : this.settings.theme;

    document.body.classList.toggle(
        "dark-theme",
        resolvedTheme === "dark"
    );

    document.documentElement.setAttribute(
        "data-font-size",
        this.settings.fontSize
    );

    if (
        this.elements.themeButton
    ) {

        this.elements
            .themeButton
            .textContent =
            resolvedTheme === "dark"
                ? "☀️"
                : "🌙";
    }

    if (
        this.elements.themeSelect
    ) {

        this.elements
            .themeSelect
            .value =
            this.settings.theme;
    }

    if (
        this.elements.fontSizeSelect
    ) {

        this.elements
            .fontSizeSelect
            .value =
            this.settings.fontSize;
    }

    if (
        this.elements.autoSpeakToggle
    ) {

        this.elements
            .autoSpeakToggle
            .checked =
            this.settings.autoSpeak;
    }
};


Dashboard.toggleTheme = function () {

    const isDark =
        document.body.classList
            .contains(
                "dark-theme"
            );

    this.settings.theme =
        isDark
            ? "light"
            : "dark";

    localStorage.setItem(
        "dashboardSettings",
        JSON.stringify(
            this.settings
        )
    );

    this.applySettings();
};


Dashboard.openSettings = function () {

    this.closeUserDropdown();

    if (
        this.elements.settingsModal
    ) {

        this.elements
            .settingsModal
            .hidden =
            false;

        this.elements
            .settingsModal
            .setAttribute(
                "aria-hidden",
                "false"
            );
    }
};


Dashboard.closeSettings = function () {

    if (
        this.elements.settingsModal
    ) {

        this.elements
            .settingsModal
            .hidden =
            true;

        this.elements
            .settingsModal
            .setAttribute(
                "aria-hidden",
                "true"
            );
    }
};


Dashboard.saveSettings = function () {

    this.settings.theme =
        this.elements
            .themeSelect
            ?.value ||
        "system";

    this.settings.fontSize =
        this.elements
            .fontSizeSelect
            ?.value ||
        "medium";

    this.settings.autoSpeak =
        Boolean(
            this.elements
                .autoSpeakToggle
                ?.checked
        );

    localStorage.setItem(
        "dashboardSettings",
        JSON.stringify(
            this.settings
        )
    );

    this.applySettings();

    this.closeSettings();

    this.showToast(
        "Settings saved.",
        "success"
    );
};


Dashboard.resetSettings = function () {

    this.settings = {
        theme: "system",
        fontSize: "medium",
        autoSpeak: false
    };

    localStorage.removeItem(
        "dashboardSettings"
    );

    this.applySettings();

    this.showToast(
        "Settings reset.",
        "success"
    );
};


/* ==========================================================
   LOGOUT
========================================================== */

Dashboard.logout = function () {

    const confirmed =
        window.confirm(
            "Are you sure you want to log out?"
        );

    if (!confirmed) {
        return;
    }

    this.stopGeneration();

    if (
        "speechSynthesis" in
        window
    ) {

        window.speechSynthesis.cancel();
    }

    localStorage.removeItem(
        "jwtToken"
    );

    localStorage.removeItem(
        "currentUser"
    );

    localStorage.removeItem(
        "activeConversationId"
    );

    window.location.replace(
        "login.html"
    );
};


/* ==========================================================
   EVENT LISTENERS
========================================================== */

Dashboard.attachEvents = function () {

    this.elements.openSidebarButton
        ?.addEventListener(
            "click",
            () =>
                this.openSidebar()
        );

    this.elements.closeSidebarButton
        ?.addEventListener(
            "click",
            () =>
                this.closeSidebar()
        );

    this.elements.sidebarOverlay
        ?.addEventListener(
            "click",
            () =>
                this.closeSidebar()
        );

    this.elements.newChatButton
        ?.addEventListener(
            "click",
            () =>
                this.startNewChat()
        );

    this.elements.refreshConversationsButton
        ?.addEventListener(
            "click",
            () =>
                this.loadConversations()
        );
        this.elements.closeProfileButton
    ?.addEventListener(
        "click",
        () =>
            this.closeProfile()
    );

this.elements.closeProfileActionButton
    ?.addEventListener(
        "click",
        () =>
            this.closeProfile()
    );

this.elements.profileLogoutButton
    ?.addEventListener(
        "click",
        () => {


            this.logout();
        }
    );

this.elements.profileModal
    ?.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                this.elements.profileModal
            ) {

                this.closeProfile();
            }
        }
    );

    this.elements.conversationSearchInput
        ?.addEventListener(
            "input",
            event => {

                this.renderConversationList(
                    event.target.value
                );
            }
        );

    this.elements.userMenuButton
        ?.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                this.toggleUserDropdown();
            }
        );

  this.elements.profileButton
    ?.addEventListener(
        "click",
        () =>
            this.openProfile()
    );

    this.elements.settingsButton
        ?.addEventListener(
            "click",
            () =>
                this.openSettings()
        );

    this.elements.logoutButton
        ?.addEventListener(
            "click",
            () =>
                this.logout()
        );

    this.elements.messageInput
        ?.addEventListener(
            "input",
            () => {

                this.autoResizeMessageInput();

                this.updateSendButtonState();
            }
        );

    this.elements.messageInput
        ?.addEventListener(
            "keydown",
            event => {

                this.handleMessageKeydown(
                    event
                );
            }
        );
        this.elements.feedbackStars
    ?.querySelectorAll(
        "[data-rating]"
    )
    .forEach(
        star => {

            star.addEventListener(
                "click",
                () => {

                    this.updateFeedbackStars(
                        Number(
                            star.dataset.rating
                        )
                    );
                }
            );
        }
    );

this.elements.feedbackLaterButton
    ?.addEventListener(
        "click",
        () => {

            this.closeFeedbackModal();
        }
    );

this.elements.submitFeedbackButton
    ?.addEventListener(
        "click",
        () => {

            this.submitFeedback();
        }
    );

this.elements.feedbackModal
    ?.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                this.elements.feedbackModal
            ) {

                this.closeFeedbackModal();
            }
        }
    );

    this.elements.chatForm
        ?.addEventListener(
            "submit",
            event => {

                this.handleChatSubmit(
                    event
                );
            }
        );

    this.elements.stopButton
        ?.addEventListener(
            "click",
            () =>
                this.stopGeneration()
        );

    document
        .querySelectorAll(
            ".suggestion-card"
        )
        .forEach(
            card => {

                card.addEventListener(
                    "click",
                    () => {

                        this.setMessageInputValue(
                            card.dataset.prompt ||
                            ""
                        );
                    }
                );
            }
        );

    this.elements.voiceButton
        ?.addEventListener(
            "click",
            () =>
                this.toggleVoiceInput()
        );

    this.elements.uploadPdfButton
        ?.addEventListener(
            "click",
            () =>
                this.elements
                    .pdfFileInput
                    ?.click()
        );

    this.elements.pdfFileInput
        ?.addEventListener(
            "change",
            event => {

                this.handlePdfSelection(
                    event.target
                        .files?.[0]
                );
            }
        );

    this.elements.removeDocumentContextButton
        ?.addEventListener(
            "click",
            () =>
                this.removePdfContext()
        );

    this.elements.pdfContextButton
        ?.addEventListener(
            "click",
            () => {

                this.showToast(
                    "Use the attachment button to select a PDF.",
                    "info"
                );
            }
        );

    this.elements.themeButton
        ?.addEventListener(
            "click",
            () =>
                this.toggleTheme()
        );

    this.elements.closeSettingsButton
        ?.addEventListener(
            "click",
            () =>
                this.closeSettings()
        );

    this.elements.saveSettingsButton
        ?.addEventListener(
            "click",
            () =>
                this.saveSettings()
        );

    this.elements.resetSettingsButton
        ?.addEventListener(
            "click",
            () =>
                this.resetSettings()
        );

    this.elements.settingsModal
        ?.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    this.elements
                        .settingsModal
                ) {

                    this.closeSettings();
                }
            }
        );

    document.addEventListener(
        "click",
        event => {

            if (
                !event.target.closest(
                    ".sidebar-user-area"
                )
            ) {

                this.closeUserDropdown();
            }
        }
    );

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            )
            if (
    this.editingMessageId
) {

    this.cancelMessageEditing();
} {

                this.closeSidebar();

                this.closeUserDropdown();

                this.closeSettings();
            }

            if (
                (
                    event.ctrlKey ||
                    event.metaKey
                ) &&
                event.key
                    .toLowerCase() ===
                    "k"
            ) {

                event.preventDefault();

                this.elements.messageInput
                    ?.focus();
            }

            if (
                (
                    event.ctrlKey ||
                    event.metaKey
                ) &&
                event.key
                    .toLowerCase() ===
                    "n"
            ) {

                event.preventDefault();

                this.startNewChat();
            }
        }
    );
    this.closeProfile();

    window.addEventListener(
        "online",
        () => {

            this.showToast(
                "Internet connection restored.",
                "success"
            );
        }
    );

    window.addEventListener(
        "offline",
        () => {

            this.showToast(
                "You are offline.",
                "warning"
            );
        }
    );
};


/* ==========================================================
   RESTORE ACTIVE CONVERSATION
========================================================== */

Dashboard.restoreActiveConversation = async function () {

    const savedId =
        localStorage.getItem(
            "activeConversationId"
        );

    if (!savedId) {
        return;
    }

    const exists =
        this.conversations.some(
            conversation =>
                String(conversation.id) ===
                String(savedId)
        );

    if (!exists) {

        localStorage.removeItem(
            "activeConversationId"
        );

        return;
    }

    await this.openConversation(
        savedId
    );
};


/* ==========================================================
   INITIALIZATION
========================================================== */

Dashboard.initialize = async function () {

    this.cacheElements();

    if (
        !this.loadAuthentication()
    ) {

        return;
    }

    this.loadUserInformation();

    this.loadSettings();

    this.initializeVoice();

   this.attachEvents();

this.startFeedbackTracking();

this.updateSendButtonState();

    this.autoResizeMessageInput();

    try {

        this.showLoading(
            "Loading your conversations..."
        );

        await this.loadConversations();

        await this.restoreActiveConversation();

    } finally {

        this.hideLoading();
    }

    console.log(
        "Professional AI dashboard initialized successfully."
    );
};


/* ==========================================================
   START APPLICATION
========================================================== */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        () =>
            Dashboard.initialize(),
        {
            once: true
        }
    );

} else {

    Dashboard.initialize();
}