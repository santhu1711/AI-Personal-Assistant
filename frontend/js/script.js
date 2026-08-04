/* ==========================================================
   AI Personal Assistant
   Script.js
   Part 1 - Constants, Application State & DOM References
   ========================================================== */

const API_BASE_URL = "https://ai-personal-assistant-production-2cfc.up.railway.app";

/* =========================
   API Configuration
========================= */

const API = {
    BASE_URL: "https://ai-personal-assistant-production-2cfc.up.railway.app",

    LOGIN: "/api/auth/login",

    REGISTER: "/api/auth/register",

    CHAT: "/api/chat",

    CONVERSATIONS: "/api/conversations",

    PDF_UPLOAD: "/api/pdf/upload",

    RAG: "/api/rag",
};


/* =========================
   Local Storage Keys
========================= */

const STORAGE = {

    TOKEN: "jwtToken",

    USER: "currentUser",

    THEME: "theme",

    ACTIVE_CONVERSATION: "activeConversationId",

};


/* =========================
   Application State
========================= */

const appState = {

    token: localStorage.getItem(STORAGE.TOKEN),

    currentUser: null,

    activeConversationId: null,

    conversations: [],

    messages: [],

    isStreaming: false,

    isTyping: false,

    isListening: false,

    selectedPdf: null,

    theme: localStorage.getItem(STORAGE.THEME) || "light",

};


/* =========================
   DOM References
========================= */

const elements = {

    /* Authentication */

    loginForm: document.getElementById("loginForm"),

    registerForm: document.getElementById("registerForm"),

    loginSection: document.getElementById("loginSection"),

    registerSection: document.getElementById("registerSection"),


    /* Chat */

    chatButton: document.getElementById("chatButton"),

    chatWindow: document.getElementById("chatWindow"),

    closeChat: document.getElementById("closeChat"),

    chatBody: document.getElementById("chatBody"),

    messageInput: document.getElementById("messageInput"),

    sendButton: document.getElementById("sendButton"),

    stopGeneratingButton: document.getElementById("stopGeneratingButton"),


    /* Sidebar */

    conversationList: document.getElementById("conversationList"),

    newConversationButton: document.getElementById("newConversationButton"),

    logoutButton: document.getElementById("logoutButton"),

    sidebarToggle: document.querySelector(".sidebar-toggle"),

    conversationSidebar: document.getElementById("conversationSidebar"),


    /* Voice */

    voiceButton: document.getElementById("voiceButton"),


    /* PDF */

    attachmentButton: document.getElementById("attachmentButton"),

    pdfFileInput: document.getElementById("pdfFileInput"),

    attachmentPreview: document.getElementById("attachmentPreview"),


    /* Toast */

    toastContainer: document.getElementById("toastContainer"),


    /* Loading */

    loadingOverlay: document.querySelector(".loading-overlay"),

};


/* =========================
   Runtime Variables
========================= */

let eventSource = null;

let typingTimeout = null;

let speechRecognition = null;

let autoSaveTimer = null;


/* =========================
   Utility Helpers
========================= */

const isLoggedIn = () => !!appState.token;

const getToken = () => appState.token;

const setToken = (token) => {

    appState.token = token;

    localStorage.setItem(STORAGE.TOKEN, token);

};

const removeToken = () => {

    appState.token = null;

    localStorage.removeItem(STORAGE.TOKEN);

};

const setTheme = (theme) => {

    appState.theme = theme;

    localStorage.setItem(STORAGE.THEME, theme);

};


/* =========================
   Console Banner
========================= */

console.log(
    "%cAI Personal Assistant Loaded",
    "color:#4f46e5;font-size:16px;font-weight:bold;"
);
/* ==========================================================
   Part 2 - Authentication Module
   ========================================================== */


/* =========================
   Parse Stored User
========================= */

function loadStoredUser() {

    const storedUser = localStorage.getItem(STORAGE.USER);

    if (!storedUser) {

        appState.currentUser = null;

        return null;

    }

    try {

        appState.currentUser = JSON.parse(storedUser);

        return appState.currentUser;

    } catch (error) {

        console.error("Unable to read stored user:", error);

        localStorage.removeItem(STORAGE.USER);

        appState.currentUser = null;

        return null;

    }

}


/* =========================
   Save Current User
========================= */

function saveCurrentUser(user) {

    appState.currentUser = user;

    localStorage.setItem(
        STORAGE.USER,
        JSON.stringify(user)
    );

}


/* =========================
   Clear Authentication
========================= */

function clearAuthentication() {

    removeToken();

    appState.currentUser = null;

    appState.activeConversationId = null;

    appState.conversations = [];

    appState.messages = [];

    localStorage.removeItem(STORAGE.USER);

    localStorage.removeItem(
        STORAGE.ACTIVE_CONVERSATION
    );

}


/* =========================
   Authentication Headers
========================= */

function getAuthHeaders(includeJson = true) {

    const headers = {};

    if (includeJson) {

        headers["Content-Type"] =
            "application/json";

    }

    if (appState.token) {

        headers.Authorization =
            `Bearer ${appState.token}`;

    }

    return headers;

}


/* =========================
   Read API Error
========================= */

async function readApiError(response) {

    const fallbackMessage =
        `Request failed with status ${response.status}.`;

    try {

        const contentType =
            response.headers.get("content-type") || "";

        if (
            contentType.includes(
                "application/json"
            )
        ) {

            const errorData =
                await response.json();

            return (
                errorData.message ||
                errorData.error ||
                errorData.details ||
                fallbackMessage
            );

        }

        const errorText =
            await response.text();

        return errorText || fallbackMessage;

    } catch (error) {

        console.error(
            "Unable to read API error:",
            error
        );

        return fallbackMessage;

    }

}


/* =========================
   Extract Token
========================= */

function extractToken(responseData) {

    return (
        responseData.token ||
        responseData.accessToken ||
        responseData.jwt ||
        responseData.jwtToken ||
        null
    );

}


/* =========================
   Extract User Information
========================= */

function extractUser(responseData) {

    if (responseData.user) {

        return responseData.user;

    }

    return {

        id:
            responseData.id ||
            responseData.userId ||
            null,

        name:
            responseData.name ||
            responseData.username ||
            responseData.email ||
            "User",

        username:
            responseData.username ||
            responseData.email ||
            null,

        email:
            responseData.email ||
            null,

    };

}


/* =========================
   Login Request
========================= */

async function loginUser(credentials) {

    const response = await fetch(
        `${API.BASE_URL}${API.LOGIN}`,
        {

            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",
            },

            body: JSON.stringify(credentials),

        }
    );

    if (!response.ok) {

        const errorMessage =
            await readApiError(response);

        throw new Error(errorMessage);

    }

    const responseData =
        await response.json();

    const token =
        extractToken(responseData);

    if (!token) {

        throw new Error(
            "Login succeeded, but the server did not return a JWT token."
        );

    }

    const user =
        extractUser(responseData);

    setToken(token);

    saveCurrentUser(user);

    return {

        token,

        user,

        responseData,

    };

}


/* =========================
   Register Request
========================= */

async function registerUser(userDetails) {

    const response = await fetch(
        `${API.BASE_URL}${API.REGISTER}`,
        {

            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",
            },

            body: JSON.stringify(userDetails),

        }
    );

    if (!response.ok) {

        const errorMessage =
            await readApiError(response);

        throw new Error(errorMessage);

    }

    const responseData =
        await response.json();

    /*
       Some backends return a JWT immediately
       after registration.

       Other backends return only a success
       message and require the user to log in.
    */

    const token =
        extractToken(responseData);

    if (token) {

        const user =
            extractUser(responseData);

        setToken(token);

        saveCurrentUser(user);

    }

    return responseData;

}


/* =========================
   Login Form Handler
========================= */

async function handleLogin(event) {

    event.preventDefault();

    if (!elements.loginForm) {

        return;

    }

    const submitButton =
        elements.loginForm.querySelector(
            'button[type="submit"]'
        );

    const formData =
        new FormData(elements.loginForm);

    const identifier =
        String(
            formData.get("email") ||
            formData.get("username") ||
            ""
        ).trim();

    const password =
        String(
            formData.get("password") ||
            ""
        );

    if (!identifier || !password) {

        showToast?.(
            "error",
            "Login failed",
            "Please enter your email or username and password."
        );

        return;

    }

    const credentials = {

        /*
           Keep the property expected by
           your Spring Boot LoginRequest DTO.

           Change "email" to "username"
           here if your backend expects username.
        */

        email: identifier,

        password,

    };

    try {

        setButtonLoading(
            submitButton,
            true,
            "Signing in..."
        );

        const result =
            await loginUser(credentials);

        console.log(
            "Logged in user:",
            result.user
        );

        elements.loginForm.reset();

        updateAuthenticatedUI(true);

        showToast?.(
            "success",
            "Welcome back",
            `Signed in as ${
                result.user.name ||
                result.user.email ||
                "User"
            }.`
        );

        /*
           Conversation loading will be
           implemented in Part 4.
        */

        if (
            typeof loadConversations ===
            "function"
        ) {

            await loadConversations();

        }

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        showToast?.(
            "error",
            "Login failed",
            error.message
        );

    } finally {

        setButtonLoading(
            submitButton,
            false
        );

    }

}


/* =========================
   Register Form Handler
========================= */

async function handleRegister(event) {

    event.preventDefault();

    if (!elements.registerForm) {

        return;

    }

    const submitButton =
        elements.registerForm.querySelector(
            'button[type="submit"]'
        );

    const formData =
        new FormData(elements.registerForm);

    const name =
        String(
            formData.get("name") ||
            ""
        ).trim();

    const email =
        String(
            formData.get("email") ||
            ""
        ).trim();

    const password =
        String(
            formData.get("password") ||
            ""
        );

    const confirmPassword =
        String(
            formData.get("confirmPassword") ||
            ""
        );

    if (!name || !email || !password) {

        showToast?.(
            "error",
            "Registration failed",
            "Please complete all required fields."
        );

        return;

    }

    if (
        confirmPassword &&
        password !== confirmPassword
    ) {

        showToast?.(
            "error",
            "Password mismatch",
            "Password and confirmation password must match."
        );

        return;

    }

    if (password.length < 6) {

        showToast?.(
            "error",
            "Weak password",
            "Password must contain at least 6 characters."
        );

        return;

    }

    const userDetails = {

        name,

        email,

        password,

    };

    try {

        setButtonLoading(
            submitButton,
            true,
            "Creating account..."
        );

        const responseData =
            await registerUser(userDetails);

        elements.registerForm.reset();

        if (extractToken(responseData)) {

            updateAuthenticatedUI(true);

            showToast?.(
                "success",
                "Account created",
                "Your account has been created and you are now signed in."
            );

        } else {

            updateAuthenticatedUI(false);

            showToast?.(
                "success",
                "Account created",
                "Your account was created successfully. Please log in."
            );

            showLoginSection();

        }

    } catch (error) {

        console.error(
            "Registration error:",
            error
        );

        showToast?.(
            "error",
            "Registration failed",
            error.message
        );

    } finally {

        setButtonLoading(
            submitButton,
            false
        );

    }

}


/* =========================
   Logout Handler
========================= */

function handleLogout() {

    if (
        appState.isStreaming &&
        typeof stopGeneratingResponse ===
        "function"
    ) {

        stopGeneratingResponse();

    }

    clearAuthentication();

    updateAuthenticatedUI(false);

    showLoginSection();

    showToast?.(
        "info",
        "Signed out",
        "You have been logged out successfully."
    );

}


/* =========================
   Authentication UI
========================= */

function updateAuthenticatedUI(
    authenticated
) {

    if (elements.loginSection) {

        elements.loginSection.style.display =
            authenticated
                ? "none"
                : "";

    }

    if (elements.registerSection) {

        elements.registerSection.style.display =
            "none";

    }

    if (elements.chatButton) {

        elements.chatButton.style.display =
            authenticated
                ? "flex"
                : "none";

    }

    if (
        !authenticated &&
        elements.chatWindow
    ) {

        elements.chatWindow.style.display =
            "none";

    }

    updateSidebarUser();

}


/* =========================
   Sidebar User Information
========================= */

function updateSidebarUser() {

    const user =
        appState.currentUser;

    const nameElement =
        document.querySelector(
            ".sidebar-user-name"
        );

    const avatarElement =
        document.querySelector(
            ".sidebar-user-avatar"
        );

    if (nameElement) {

        nameElement.textContent =
            user?.name ||
            user?.username ||
            user?.email ||
            "Guest";

    }

    if (avatarElement) {

        const displayName =
            user?.name ||
            user?.username ||
            user?.email ||
            "U";

        avatarElement.textContent =
            displayName
                .charAt(0)
                .toUpperCase();

    }

}


/* =========================
   Login and Register Views
========================= */

function showLoginSection() {

    if (elements.loginSection) {

        elements.loginSection.style.display =
            "";

    }

    if (elements.registerSection) {

        elements.registerSection.style.display =
            "none";

    }

}


function showRegisterSection() {

    if (elements.loginSection) {

        elements.loginSection.style.display =
            "none";

    }

    if (elements.registerSection) {

        elements.registerSection.style.display =
            "";

    }

}


/* =========================
   Button Loading State
========================= */

function setButtonLoading(
    button,
    loading,
    loadingText = "Please wait..."
) {

    if (!button) {

        return;

    }

    if (loading) {

        button.dataset.originalText =
            button.textContent;

        button.textContent =
            loadingText;

        button.disabled = true;

        return;

    }

    button.textContent =
        button.dataset.originalText ||
        button.textContent;

    button.disabled = false;

    delete button.dataset.originalText;

}


/* =========================
   Check Stored Authentication
========================= */

function restoreAuthentication() {

    loadStoredUser();

    const authenticated =
        isLoggedIn();

    updateAuthenticatedUI(
        authenticated
    );

    return authenticated;

}
/* ==========================================================
   Part 3 - Chat Window, Sidebar and UI Controls
   ========================================================== */


/* =========================
   Open Chat Window
========================= */

function openChatWindow() {

    if (!elements.chatWindow) {
        return;
    }

    elements.chatWindow.style.display = "block";

    elements.chatWindow.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "chat-open"
    );

    /*
       Focus the message input only when
       the user is already authenticated.
    */

    if (
        isLoggedIn() &&
        elements.messageInput
    ) {

        setTimeout(() => {

            elements.messageInput.focus();

        }, 150);

    }

}


/* =========================
   Close Chat Window
========================= */

function closeChatWindow() {

    if (!elements.chatWindow) {
        return;
    }

    elements.chatWindow.style.display = "none";

    elements.chatWindow.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "chat-open"
    );

    closeMobileSidebar();

}


/* =========================
   Toggle Chat Window
========================= */

function toggleChatWindow() {

    if (!elements.chatWindow) {
        return;
    }

    const isOpen =
        window.getComputedStyle(
            elements.chatWindow
        ).display !== "none";

    if (isOpen) {

        closeChatWindow();

    } else {

        openChatWindow();

    }

}


/* =========================
   Mobile Sidebar Overlay
========================= */

function getSidebarOverlay() {

    return document.querySelector(
        ".sidebar-overlay"
    );

}


/* =========================
   Open Mobile Sidebar
========================= */

function openMobileSidebar() {

    if (!elements.conversationSidebar) {
        return;
    }

    elements.conversationSidebar.classList.add(
        "active"
    );

    elements.conversationSidebar.setAttribute(
        "aria-hidden",
        "false"
    );

    const overlay =
        getSidebarOverlay();

    if (overlay) {

        overlay.classList.add("active");

    }

    if (elements.sidebarToggle) {

        elements.sidebarToggle.setAttribute(
            "aria-expanded",
            "true"
        );

    }

}


/* =========================
   Close Mobile Sidebar
========================= */

function closeMobileSidebar() {

    if (!elements.conversationSidebar) {
        return;
    }

    elements.conversationSidebar.classList.remove(
        "active"
    );

    if (window.innerWidth <= 700) {

        elements.conversationSidebar.setAttribute(
            "aria-hidden",
            "true"
        );

    }

    const overlay =
        getSidebarOverlay();

    if (overlay) {

        overlay.classList.remove("active");

    }

    if (elements.sidebarToggle) {

        elements.sidebarToggle.setAttribute(
            "aria-expanded",
            "false"
        );

    }

}


/* =========================
   Toggle Mobile Sidebar
========================= */

function toggleMobileSidebar() {

    if (!elements.conversationSidebar) {
        return;
    }

    const isOpen =
        elements.conversationSidebar.classList.contains(
            "active"
        );

    if (isOpen) {

        closeMobileSidebar();

    } else {

        openMobileSidebar();

    }

}


/* =========================
   Responsive Sidebar State
========================= */

function updateSidebarForScreenSize() {

    if (!elements.conversationSidebar) {
        return;
    }

    if (window.innerWidth > 700) {

        elements.conversationSidebar.classList.remove(
            "active"
        );

        elements.conversationSidebar.setAttribute(
            "aria-hidden",
            "false"
        );

        const overlay =
            getSidebarOverlay();

        if (overlay) {

            overlay.classList.remove("active");

        }

        if (elements.sidebarToggle) {

            elements.sidebarToggle.setAttribute(
                "aria-expanded",
                "false"
            );

        }

        return;

    }

    const isOpen =
        elements.conversationSidebar.classList.contains(
            "active"
        );

    elements.conversationSidebar.setAttribute(
        "aria-hidden",
        String(!isOpen)
    );

}


/* =========================
   Scroll Chat to Bottom
========================= */

function scrollChatToBottom(
    smooth = true
) {

    if (!elements.chatBody) {
        return;
    }

    elements.chatBody.scrollTo({

        top:
            elements.chatBody.scrollHeight,

        behavior:
            smooth
                ? "smooth"
                : "auto",

    });

}


/* =========================
   Auto-Grow Message Input
========================= */

function autoGrowMessageInput() {

    if (!elements.messageInput) {
        return;
    }

    elements.messageInput.style.height =
        "auto";

    const maximumHeight = 140;

    const nextHeight =
        Math.min(
            elements.messageInput.scrollHeight,
            maximumHeight
        );

    elements.messageInput.style.height =
        `${nextHeight}px`;

    elements.messageInput.style.overflowY =
        elements.messageInput.scrollHeight >
        maximumHeight
            ? "auto"
            : "hidden";

}


/* =========================
   Reset Message Input
========================= */

function resetMessageInput() {

    if (!elements.messageInput) {
        return;
    }

    elements.messageInput.value = "";

    elements.messageInput.style.height =
        "auto";

    elements.messageInput.style.overflowY =
        "hidden";

    updateSendButtonState();

}


/* =========================
   Send Button State
========================= */

function updateSendButtonState() {

    if (!elements.sendButton) {
        return;
    }

    const message =
        elements.messageInput?.value
            .trim() || "";

    const hasPdf =
        Boolean(appState.selectedPdf);

    const canSend =
        Boolean(message || hasPdf) &&
        !appState.isStreaming;

    elements.sendButton.disabled =
        !canSend;

}


/* =========================
   Streaming UI State
========================= */

function setStreamingUI(
    streaming
) {

    appState.isStreaming =
        streaming;

    if (elements.messageInput) {

        elements.messageInput.disabled =
            streaming;

    }

    if (elements.sendButton) {

        elements.sendButton.style.display =
            streaming
                ? "none"
                : "flex";

    }

    if (
        elements.stopGeneratingButton
    ) {

        elements.stopGeneratingButton.classList.toggle(
            "active",
            streaming
        );

        elements.stopGeneratingButton.disabled =
            !streaming;

    }

    updateSendButtonState();

}


/* =========================
   Typing UI State
========================= */

function setTypingState(
    typing
) {

    appState.isTyping =
        typing;

    if (elements.chatWindow) {

        elements.chatWindow.classList.toggle(
            "assistant-typing",
            typing
        );

    }

}


/* =========================
   Escape Key Handler
========================= */

function handleGlobalEscapeKey(
    event
) {

    if (event.key !== "Escape") {
        return;
    }

    const sidebarOpen =
        elements.conversationSidebar
            ?.classList.contains(
                "active"
            );

    if (sidebarOpen) {

        closeMobileSidebar();

        return;

    }

    const activeModal =
        document.querySelector(
            ".modal-overlay.active"
        );

    if (activeModal) {

        activeModal.classList.remove(
            "active"
        );

        return;

    }

    const chatIsOpen =
        elements.chatWindow &&
        window.getComputedStyle(
            elements.chatWindow
        ).display !== "none";

    if (chatIsOpen) {

        closeChatWindow();

    }

}


/* =========================
   Close Sidebar After Selection
========================= */

function closeSidebarOnMobile() {

    if (window.innerWidth <= 700) {

        closeMobileSidebar();

    }

}


/* =========================
   Update Chat Header
========================= */

function updateChatHeader(
    title = "AI Personal Assistant",
    subtitle = "Online"
) {

    const titleElement =
        document.querySelector(
            "#chatHeader h3"
        );

    const subtitleElement =
        document.querySelector(
            "#chatHeader small"
        );

    if (titleElement) {

        titleElement.textContent =
            title;

    }

    if (subtitleElement) {

        subtitleElement.textContent =
            subtitle;

    }

}


/* =========================
   Set Chat Status
========================= */

function setChatStatus(
    status
) {

    const statusText =
        typeof status === "string"
            ? status
            : "Online";

    updateChatHeader(
        "AI Personal Assistant",
        statusText
    );

}


/* =========================
   Window Resize Handler
========================= */

function handleWindowResize() {

    clearTimeout(
        handleWindowResize.timer
    );

    handleWindowResize.timer =
        setTimeout(() => {

            updateSidebarForScreenSize();

            autoGrowMessageInput();

        }, 120);

}


/* =========================
   Window Click Helper
========================= */

function handleOutsideChatClick(
    event
) {

    /*
       We intentionally do not close the chat
       automatically on desktop because users
       may click outside while reading a response.

       This function is kept as a future hook.
    */

    return event;

}
/* =========================================================
   PART 4: CONVERSATION MANAGEMENT
========================================================= */

/**
 * Loads all conversations belonging to the logged-in user.
 */
async function loadConversations() {
    if (!isLoggedIn()) {
        return;
    }

    try {
        appState.isLoadingConversations = true;

        renderConversationSkeletons();

        const response = await fetch(
            `${API_BASE_URL}/api/conversations`,
            {
                method: "GET",
                headers: getAuthHeaders()
            }
        );

        if (response.status === 401 || response.status === 403) {
            clearAuthentication();
            updateAuthenticatedUI();
            showToast?.("Your session has expired. Please log in again.", "error");
            return;
        }

        if (!response.ok) {
            throw new Error(await readApiError(response));
        }

        const data = await response.json();

        appState.conversations = normalizeConversationList(data);

        renderConversationList();

    } catch (error) {
        console.error("Failed to load conversations:", error);

        appState.conversations = [];
        renderConversationList();

        showToast?.(
            error.message || "Unable to load conversations.",
            "error"
        );
    } finally {
        appState.isLoadingConversations = false;
    }
}


/**
 * Creates a new conversation in the backend.
 */
async function createConversation(title = "New Chat") {
    if (!isLoggedIn()) {
        showToast?.("Please log in to start a conversation.", "warning");
        return null;
    }

    if (appState.isCreatingConversation) {
        return null;
    }

    try {
        appState.isCreatingConversation = true;

        const response = await fetch(
            `${API_BASE_URL}/api/conversations`,
            {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    title: title
                })
            }
        );

        if (response.status === 401 || response.status === 403) {
            clearAuthentication();
            updateAuthenticatedUI();
            showToast?.("Your session has expired. Please log in again.", "error");
            return null;
        }

        if (!response.ok) {
            throw new Error(await readApiError(response));
        }

        const newConversation = await response.json();

        appState.conversations.unshift(newConversation);
        appState.activeConversationId = getConversationId(newConversation);

        renderConversationList();
        clearChatMessages();
        updateChatHeader(newConversation.title || "New Chat");
        updateEmptyChatState();

        closeSidebarOnMobile();

        return newConversation;

    } catch (error) {
        console.error("Failed to create conversation:", error);

        showToast?.(
            error.message || "Unable to create a new conversation.",
            "error"
        );

        return null;
    } finally {
        appState.isCreatingConversation = false;
    }
}


/**
 * Opens an existing conversation and loads its messages.
 */
async function openConversation(conversationId) {
    if (!conversationId || appState.isStreaming) {
        return;
    }

    const normalizedId = String(conversationId);

    if (
        String(appState.activeConversationId) === normalizedId &&
        appState.messages.length > 0
    ) {
        closeSidebarOnMobile();
        return;
    }

    try {
        appState.activeConversationId = conversationId;
        appState.messages = [];

        renderConversationList();
        clearChatMessages();
        setTypingState(true);

        const selectedConversation =
            findConversationById(conversationId);

        updateChatHeader(
            selectedConversation?.title || "Conversation"
        );

        const response = await fetch(
            `${API_BASE_URL}/api/conversations/${conversationId}`,
            {
                method: "GET",
                headers: getAuthHeaders()
            }
        );

        if (response.status === 401 || response.status === 403) {
            clearAuthentication();
            updateAuthenticatedUI();
            showToast?.("Your session has expired. Please log in again.", "error");
            return;
        }

        if (response.status === 404) {
            removeConversationFromState(conversationId);

            showToast?.(
                "This conversation could not be found.",
                "error"
            );

            return;
        }

        if (!response.ok) {
            throw new Error(await readApiError(response));
        }

        const conversationData = await response.json();

        const messages =
            conversationData.messages ||
            conversationData.chatMessages ||
            [];

        appState.messages = Array.isArray(messages)
            ? messages
            : [];

        renderConversationMessages(appState.messages);
        updateEmptyChatState();
        scrollChatToBottom();

        closeSidebarOnMobile();

    } catch (error) {
        console.error("Failed to open conversation:", error);

        clearChatMessages();
        updateEmptyChatState();

        showToast?.(
            error.message || "Unable to open this conversation.",
            "error"
        );
    } finally {
        setTypingState(false);
    }
}


/**
 * Renames an existing conversation.
 */
async function renameConversation(conversationId, currentTitle = "") {
    const newTitle = window.prompt(
        "Enter a new conversation title:",
        currentTitle
    );

    if (newTitle === null) {
        return;
    }

    const trimmedTitle = newTitle.trim();

    if (!trimmedTitle) {
        showToast?.("Conversation title cannot be empty.", "warning");
        return;
    }

    if (trimmedTitle === currentTitle.trim()) {
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/api/conversations/${conversationId}`,
            {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    title: trimmedTitle
                })
            }
        );

        if (!response.ok) {
            throw new Error(await readApiError(response));
        }

        const updatedConversation = await response.json();

        updateConversationInState(
            conversationId,
            updatedConversation
        );

        renderConversationList();

        if (
            String(appState.activeConversationId) ===
            String(conversationId)
        ) {
            updateChatHeader(
                updatedConversation.title || trimmedTitle
            );
        }

        showToast?.("Conversation renamed successfully.", "success");

    } catch (error) {
        console.error("Failed to rename conversation:", error);

        showToast?.(
            error.message || "Unable to rename the conversation.",
            "error"
        );
    }
}


/**
 * Deletes a conversation after confirmation.
 */
async function deleteConversation(conversationId) {
    const confirmed = window.confirm(
        "Are you sure you want to delete this conversation?"
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/api/conversations/${conversationId}`,
            {
                method: "DELETE",
                headers: getAuthHeaders()
            }
        );

        if (!response.ok && response.status !== 204) {
            throw new Error(await readApiError(response));
        }

        removeConversationFromState(conversationId);

        const deletedActiveConversation =
            String(appState.activeConversationId) ===
            String(conversationId);

        if (deletedActiveConversation) {
            appState.activeConversationId = null;
            appState.messages = [];

            clearChatMessages();
            updateChatHeader("New Chat");
            updateEmptyChatState();
        }

        renderConversationList();

        showToast?.("Conversation deleted successfully.", "success");

    } catch (error) {
        console.error("Failed to delete conversation:", error);

        showToast?.(
            error.message || "Unable to delete the conversation.",
            "error"
        );
    }
}


/**
 * Displays the complete conversation list in the sidebar.
 */
function renderConversationList() {
    if (!conversationList) {
        return;
    }

    conversationList.innerHTML = "";

    if (!appState.conversations.length) {
        conversationList.appendChild(
            createEmptyConversationElement()
        );

        return;
    }

    const fragment = document.createDocumentFragment();

    appState.conversations.forEach((conversation) => {
        fragment.appendChild(
            createConversationElement(conversation)
        );
    });

    conversationList.appendChild(fragment);
}


/**
 * Creates one conversation item for the sidebar.
 */
function createConversationElement(conversation) {
    const conversationId = getConversationId(conversation);
    const title = conversation.title?.trim() || "New Chat";

    const item = document.createElement("div");
    item.className = "conversation-item";
    item.dataset.conversationId = conversationId;

    const isActive =
        String(appState.activeConversationId) ===
        String(conversationId);

    if (isActive) {
        item.classList.add("active");
    }

    const titleButton = document.createElement("button");
    titleButton.type = "button";
    titleButton.className = "conversation-title";
    titleButton.textContent = title;
    titleButton.title = title;

    titleButton.addEventListener("click", () => {
        openConversation(conversationId);
    });

    const actions = document.createElement("div");
    actions.className = "conversation-actions";

    const renameButton = document.createElement("button");
    renameButton.type = "button";
    renameButton.className = "conversation-action-button";
    renameButton.setAttribute("aria-label", "Rename conversation");
    renameButton.title = "Rename";
    renameButton.textContent = "✏️";

    renameButton.addEventListener("click", (event) => {
        event.stopPropagation();

        renameConversation(conversationId, title);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "conversation-action-button delete";
    deleteButton.setAttribute("aria-label", "Delete conversation");
    deleteButton.title = "Delete";
    deleteButton.textContent = "🗑️";

    deleteButton.addEventListener("click", (event) => {
        event.stopPropagation();

        deleteConversation(conversationId);
    });

    actions.append(renameButton, deleteButton);
    item.append(titleButton, actions);

    return item;
}


/**
 * Creates the empty-conversation sidebar message.
 */
function createEmptyConversationElement() {
    const emptyElement = document.createElement("div");
    emptyElement.className = "empty-conversations";

    const message = document.createElement("p");
    message.textContent = "No conversations yet.";

    const hint = document.createElement("span");
    hint.textContent = "Start a new chat to begin.";

    emptyElement.append(message, hint);

    return emptyElement;
}


/**
 * Shows temporary loading placeholders in the sidebar.
 */
function renderConversationSkeletons(count = 4) {
    if (!conversationList) {
        return;
    }

    conversationList.innerHTML = "";

    const fragment = document.createDocumentFragment();

    for (let index = 0; index < count; index += 1) {
        const skeleton = document.createElement("div");
        skeleton.className = "conversation-skeleton";

        fragment.appendChild(skeleton);
    }

    conversationList.appendChild(fragment);
}


/**
 * Converts different backend response formats into an array.
 */
function normalizeConversationList(data) {
    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data?.conversations)) {
        return data.conversations;
    }

    if (Array.isArray(data?.content)) {
        return data.content;
    }

    return [];
}


/**
 * Returns a conversation's ID safely.
 */
function getConversationId(conversation) {
    return (
        conversation?.id ??
        conversation?.conversationId ??
        null
    );
}


/**
 * Finds one conversation from the application state.
 */
function findConversationById(conversationId) {
    return appState.conversations.find((conversation) => {
        return (
            String(getConversationId(conversation)) ===
            String(conversationId)
        );
    });
}


/**
 * Updates one conversation inside application state.
 */
function updateConversationInState(
    conversationId,
    updatedConversation
) {
    appState.conversations = appState.conversations.map(
        (conversation) => {
            const currentId = getConversationId(conversation);

            if (
                String(currentId) !==
                String(conversationId)
            ) {
                return conversation;
            }

            return {
                ...conversation,
                ...updatedConversation
            };
        }
    );
}


/**
 * Removes one conversation from application state.
 */
function removeConversationFromState(conversationId) {
    appState.conversations = appState.conversations.filter(
        (conversation) => {
            return (
                String(getConversationId(conversation)) !==
                String(conversationId)
            );
        }
    );
}


/**
 * Clears all message elements from the chat body.
 */
function clearChatMessages() {
    if (!chatMessages) {
        return;
    }

    chatMessages.innerHTML = "";
}


/**
 * Displays messages belonging to an opened conversation.
 */
function renderConversationMessages(messages) {
    clearChatMessages();

    if (!Array.isArray(messages) || messages.length === 0) {
        updateEmptyChatState();
        return;
    }

    messages.forEach((message) => {
        const role =
            message.role ||
            message.sender ||
            message.messageType ||
            "assistant";

        const content =
            message.content ||
            message.message ||
            message.text ||
            "";

        renderStoredMessage(role, content);
    });
}


/**
 * Renders one previously stored message.
 *
 * This temporary function will be improved in Part 7,
 * where Markdown and copy buttons are handled fully.
 */
function renderStoredMessage(role, content) {
    if (!chatMessages || !content) {
        return;
    }

    const normalizedRole =
        String(role).toLowerCase();

    const isUser =
        normalizedRole === "user" ||
        normalizedRole === "human";

    const messageElement = document.createElement("div");

    messageElement.className = isUser
        ? "message user"
        : "message ai";

    const messageContent = document.createElement("div");
    messageContent.className = "message-content";

    if (!isUser && typeof marked !== "undefined") {
        messageContent.innerHTML = marked.parse(content);
    } else {
        messageContent.textContent = content;
    }

    messageElement.appendChild(messageContent);

    chatMessages.appendChild(messageElement);
}


/**
 * Controls the empty chat welcome screen.
 */
function updateEmptyChatState() {
    if (!emptyChatState) {
        return;
    }

    const hasMessages =
        Array.isArray(appState.messages) &&
        appState.messages.length > 0;

    emptyChatState.hidden = hasMessages;
}
/* =========================================================
   PART 5: SENDING MESSAGES
========================================================= */

/**
 * Handles the chat form submission.
 *
 * The actual AI streaming request will be implemented
 * in Part 6.
 */
async function handleMessageSubmit(event) {
    event?.preventDefault();

    await sendMessage();
}


/**
 * Reads the input and starts the message-sending process.
 */
async function sendMessage() {
    if (!isLoggedIn()) {
        showToast?.(
            "Please log in before sending a message.",
            "warning"
        );

        return;
    }

    if (!messageInput) {
        console.error("Message input element was not found.");
        return;
    }

    const messageText = normalizeMessageText(
        messageInput.value
    );

    if (!messageText) {
        updateSendButtonState();
        return;
    }

    if (appState.isStreaming || appState.isSendingMessage) {
        return;
    }

    try {
        appState.isSendingMessage = true;

        updateSendButtonState();
        setStreamingUI(true);

        /*
         * Create a conversation automatically
         * when the user sends the first message.
         */
        const conversation =
            await ensureActiveConversation(messageText);

        if (!conversation) {
            throw new Error(
                "Unable to create or select a conversation."
            );
        }

        const conversationId =
            appState.activeConversationId;

        /*
         * Add the user's message to the interface
         * before waiting for the AI response.
         */
        const userMessage = createLocalMessage({
            role: "user",
            content: messageText,
            conversationId
        });

        addMessageToState(userMessage);
        renderUserMessage(messageText);

        resetMessageInput();
        updateEmptyChatState();
        scrollChatToBottom();
        closeSidebarOnMobile();

        /*
         * Part 6 will implement this function.
         */
        if (typeof streamAssistantResponse !== "function") {
            throw new Error(
                "AI streaming is not available yet. Complete Part 6."
            );
        }

        await streamAssistantResponse({
            conversationId,
            message: messageText
        });

    } catch (error) {
        console.error("Failed to send message:", error);

        showToast?.(
            error.message || "Unable to send your message.",
            "error"
        );

    } finally {
        appState.isSendingMessage = false;

        /*
         * Part 6 will control isStreaming while
         * the assistant response is being received.
         */
        if (!appState.isStreaming) {
            setStreamingUI(false);
        }

        updateSendButtonState();
        messageInput?.focus();
    }
}


/**
 * Ensures that a conversation exists before sending.
 *
 * If there is no active conversation, a new one is created.
 */
async function ensureActiveConversation(firstMessage = "") {
    if (appState.activeConversationId) {
        return findConversationById(
            appState.activeConversationId
        ) || {
            id: appState.activeConversationId,
            title: "Conversation"
        };
    }

    const conversationTitle =
        generateConversationTitle(firstMessage);

    const newConversation =
        await createConversation(conversationTitle);

    if (!newConversation) {
        return null;
    }

    appState.activeConversationId =
        getConversationId(newConversation);

    return newConversation;
}


/**
 * Creates a short title from the user's first message.
 */
function generateConversationTitle(message) {
    const normalizedMessage =
        normalizeMessageText(message);

    if (!normalizedMessage) {
        return "New Chat";
    }

    const maximumLength = 45;

    if (normalizedMessage.length <= maximumLength) {
        return normalizedMessage;
    }

    return `${normalizedMessage.slice(0, maximumLength).trim()}...`;
}


/**
 * Normalizes whitespace in the message while preserving
 * intentional line breaks.
 */
function normalizeMessageText(value) {
    if (typeof value !== "string") {
        return "";
    }

    return value
        .replace(/\r\n/g, "\n")
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}


/**
 * Creates a temporary local message object.
 *
 * The backend-generated message ID can replace this later
 * when the API response is received.
 */
function createLocalMessage({
    role,
    content,
    conversationId
}) {
    return {
        id: createTemporaryMessageId(),
        conversationId,
        role,
        content,
        createdAt: new Date().toISOString(),
        isTemporary: true
    };
}


/**
 * Generates a temporary frontend-only message ID.
 */
function createTemporaryMessageId() {
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {
        return crypto.randomUUID();
    }

    return `temp-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 10)}`;
}


/**
 * Adds one message to the current application state.
 */
function addMessageToState(message) {
    if (!message) {
        return;
    }

    if (!Array.isArray(appState.messages)) {
        appState.messages = [];
    }

    appState.messages.push(message);
}


/**
 * Removes a temporary message from application state.
 *
 * This can be used later if a request fails and we decide
 * to roll back the optimistic message.
 */
function removeMessageFromState(messageId) {
    if (!messageId || !Array.isArray(appState.messages)) {
        return;
    }

    appState.messages = appState.messages.filter(
        (message) => {
            return String(message.id) !== String(messageId);
        }
    );
}


/**
 * Displays the user's message in the chat interface.
 */
function renderUserMessage(content) {
    if (!chatMessages || !content) {
        return null;
    }

    const messageElement =
        document.createElement("div");

    messageElement.className = "message user";

    const messageContent =
        document.createElement("div");

    messageContent.className = "message-content";
    messageContent.textContent = content;

    messageElement.appendChild(messageContent);
    chatMessages.appendChild(messageElement);

    return messageElement;
}


/**
 * Handles Enter and Shift + Enter inside the message input.
 *
 * Enter sends the message.
 * Shift + Enter creates a new line.
 */
function handleMessageInputKeydown(event) {
    if (!event || event.key !== "Enter") {
        return;
    }

    if (event.shiftKey) {
        return;
    }

    /*
     * Do not submit while an IME composition is active.
     * This is useful when typing in languages that use
     * input composition.
     */
    if (event.isComposing) {
        return;
    }

    event.preventDefault();

    sendMessage();
}


/**
 * Handles changes inside the message input.
 */
function handleMessageInput() {
    autoGrowMessageInput();
    updateSendButtonState();
}


/**
 * Updates the conversation title after the first message.
 *
 * This is optional because createConversation() already
 * receives a generated title. It can be used later if the
 * backend initially creates every chat as "New Chat".
 */
async function updateConversationTitleFromMessage(
    conversationId,
    message
) {
    const conversation =
        findConversationById(conversationId);

    if (!conversation) {
        return;
    }

    const currentTitle =
        conversation.title?.trim() || "";

    if (
        currentTitle &&
        currentTitle.toLowerCase() !== "new chat"
    ) {
        return;
    }

    const generatedTitle =
        generateConversationTitle(message);

    try {
        const response = await fetch(
            `${API_BASE_URL}/api/conversations/${conversationId}`,
            {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    title: generatedTitle
                })
            }
        );

        if (!response.ok) {
            throw new Error(
                await readApiError(response)
            );
        }

        const updatedConversation =
            await response.json();

        updateConversationInState(
            conversationId,
            updatedConversation
        );

        renderConversationList();

        updateChatHeader(
            updatedConversation.title ||
            generatedTitle
        );

    } catch (error) {
        /*
         * A title-update failure should not interrupt
         * the actual chat.
         */
        console.warn(
            "Unable to update conversation title:",
            error
        );
    }
}
/* =========================================================
   PART 6: AI STREAMING WITH SSE
========================================================= */

/*
 * Stores the controller for the currently active request.
 * This allows the user to stop response generation.
 */
let activeStreamController = null;


/**
 * Sends the user's message to the backend and streams
 * the assistant response using Server-Sent Events.
 */
async function streamAssistantResponse({
    conversationId,
    message
}) {
    if (!conversationId || !message) {
        throw new Error(
            "Conversation ID and message are required."
        );
    }

    if (appState.isStreaming) {
        return;
    }

    activeStreamController = new AbortController();

    const assistantMessageElement =
        createStreamingAssistantMessage();

    const assistantMessageContent =
        assistantMessageElement?.querySelector(
            ".message-content"
        );

    if (!assistantMessageElement || !assistantMessageContent) {
        activeStreamController = null;

        throw new Error(
            "Unable to create the assistant message."
        );
    }

    let assistantResponse = "";

    try {
        appState.isStreaming = true;

        setStreamingUI(true);
        setTypingState(true);
        updateSendButtonState();

        const response = await fetch(
            `${API_BASE_URL}/api/chat/stream`,
            {
                method: "POST",
                headers: {
                    ...getAuthHeaders(),
                    Accept: "text/event-stream"
                },
                body: JSON.stringify({
                    conversationId,
                    message
                }),
                signal: activeStreamController.signal
            }
        );

        if (
            response.status === 401 ||
            response.status === 403
        ) {
            clearAuthentication();
            updateAuthenticatedUI();

            throw new Error(
                "Your session has expired. Please log in again."
            );
        }

        if (!response.ok) {
            throw new Error(
                await readApiError(response)
            );
        }

        if (!response.body) {
            throw new Error(
                "The browser could not read the streamed response."
            );
        }

        setTypingState(false);

        assistantResponse =
            await readStreamingResponse({
                response,
                assistantMessageContent
            });

        const normalizedResponse =
            assistantResponse.trim();

        if (!normalizedResponse) {
            throw new Error(
                "The AI returned an empty response."
            );
        }

        /*
         * Render the final Markdown once streaming finishes.
         */
        renderAssistantMarkdown(
            assistantMessageContent,
            normalizedResponse
        );

        const assistantMessage =
            createLocalMessage({
                role: "assistant",
                content: normalizedResponse,
                conversationId
            });

        addMessageToState(assistantMessage);

        assistantMessageElement.classList.remove(
            "streaming"
        );

        assistantMessageElement.dataset.messageId =
            assistantMessage.id;

        updateEmptyChatState();
        scrollChatToBottom();

        /*
         * Part 7 will improve this copy button.
         */
        addTemporaryCopyButton(
            assistantMessageElement,
            normalizedResponse
        );

        return normalizedResponse;

    } catch (error) {
        setTypingState(false);

        if (error.name === "AbortError") {
            handleStoppedStream({
                assistantMessageElement,
                assistantMessageContent,
                assistantResponse,
                conversationId
            });

            return assistantResponse;
        }

        console.error(
            "AI streaming failed:",
            error
        );

        handleStreamingError({
            assistantMessageElement,
            assistantMessageContent,
            assistantResponse,
            error
        });

        throw error;

    } finally {
        appState.isStreaming = false;
        activeStreamController = null;

        setTypingState(false);
        setStreamingUI(false);
        updateSendButtonState();

        messageInput?.focus();
    }
}


/**
 * Reads chunks from the response stream.
 */
async function readStreamingResponse({
    response,
    assistantMessageContent
}) {
    const reader =
        response.body.getReader();

    const decoder =
        new TextDecoder("utf-8");

    let buffer = "";
    let completeResponse = "";
    let streamFinished = false;

    try {
        while (!streamFinished) {
            const {
                value,
                done
            } = await reader.read();

            if (done) {
                break;
            }

            buffer += decoder.decode(
                value,
                {
                    stream: true
                }
            );

            const parsedResult =
                processSseBuffer(buffer);

            buffer = parsedResult.remainingBuffer;

            for (const eventData of parsedResult.events) {
                if (isStreamDoneEvent(eventData)) {
                    streamFinished = true;
                    break;
                }

                const content =
                    extractStreamContent(eventData);

                if (!content) {
                    continue;
                }

                completeResponse += content;

                updateStreamingMessage(
                    assistantMessageContent,
                    completeResponse
                );
            }
        }

        /*
         * Decode any remaining bytes.
         */
        buffer += decoder.decode();

        if (buffer.trim()) {
            const finalResult =
                processSseBuffer(
                    `${buffer}\n\n`
                );

            for (const eventData of finalResult.events) {
                if (isStreamDoneEvent(eventData)) {
                    break;
                }

                const content =
                    extractStreamContent(eventData);

                if (!content) {
                    continue;
                }

                completeResponse += content;

                updateStreamingMessage(
                    assistantMessageContent,
                    completeResponse
                );
            }
        }

        return completeResponse;

    } finally {
        reader.releaseLock();
    }
}


/**
 * Splits an SSE buffer into completed events and
 * an unfinished remaining section.
 */
function processSseBuffer(buffer) {
    const normalizedBuffer =
        buffer.replace(/\r\n/g, "\n");

    const eventBlocks =
        normalizedBuffer.split("\n\n");

    const remainingBuffer =
        eventBlocks.pop() || "";

    const events = eventBlocks
        .map(parseSseEventBlock)
        .filter((eventData) => eventData !== null);

    return {
        events,
        remainingBuffer
    };
}


/**
 * Extracts all data lines from one SSE event.
 *
 * Example:
 *
 * data: Hello
 * data: world
 */
function parseSseEventBlock(eventBlock) {
    if (!eventBlock?.trim()) {
        return null;
    }

    const dataLines = eventBlock
        .split("\n")
        .filter((line) => {
            return line.startsWith("data:");
        })
        .map((line) => {
            return line.slice(5).replace(/^ /, "");
        });

    if (!dataLines.length) {
        return null;
    }

    return dataLines.join("\n");
}


/**
 * Checks whether the backend has finished streaming.
 */
function isStreamDoneEvent(eventData) {
    if (typeof eventData !== "string") {
        return false;
    }

    const normalizedData =
        eventData.trim().toUpperCase();

    return (
        normalizedData === "[DONE]" ||
        normalizedData === "DONE"
    );
}


/**
 * Extracts text from different possible backend formats.
 *
 * Supported examples:
 *
 * data: Hello
 *
 * data: {"content":"Hello"}
 *
 * data: {"token":"Hello"}
 *
 * data: {"message":"Hello"}
 *
 * data: {"delta":"Hello"}
 */
function extractStreamContent(eventData) {
    if (
        typeof eventData !== "string" ||
        !eventData
    ) {
        return "";
    }

    const trimmedData =
        eventData.trim();

    if (!trimmedData) {
        return "";
    }

    if (isStreamDoneEvent(trimmedData)) {
        return "";
    }

    /*
     * Attempt to parse JSON returned by the backend.
     */
    try {
        const parsedData =
            JSON.parse(trimmedData);

        return extractTextFromStreamObject(
            parsedData
        );

    } catch {
        /*
         * The event is plain text rather than JSON.
         */
        return decodeEscapedStreamText(
            eventData
        );
    }
}


/**
 * Extracts streamed text from a parsed JSON object.
 */
function extractTextFromStreamObject(data) {
    if (typeof data === "string") {
        return data;
    }

    if (!data || typeof data !== "object") {
        return "";
    }

    const directContent =
        data.content ??
        data.token ??
        data.text ??
        data.delta ??
        data.message ??
        data.response;

    if (typeof directContent === "string") {
        return directContent;
    }

    /*
     * Supports OpenAI/OpenRouter-style responses.
     */
    const choiceContent =
        data.choices?.[0]?.delta?.content ??
        data.choices?.[0]?.message?.content ??
        data.choices?.[0]?.text;

    if (typeof choiceContent === "string") {
        return choiceContent;
    }

    /*
     * Supports nested backend response objects.
     */
    const nestedContent =
        data.data?.content ??
        data.data?.token ??
        data.data?.text ??
        data.data?.message;

    if (typeof nestedContent === "string") {
        return nestedContent;
    }

    return "";
}


/**
 * Converts escaped newline and tab characters when the
 * backend sends them as plain text.
 */
function decodeEscapedStreamText(value) {
    if (typeof value !== "string") {
        return "";
    }

    return value
        .replace(/\\n/g, "\n")
        .replace(/\\t/g, "\t")
        .replace(/\\"/g, "\"");
}


/**
 * Creates an empty assistant bubble for the incoming stream.
 */
function createStreamingAssistantMessage() {
    if (!chatMessages) {
        return null;
    }

    const messageElement =
        document.createElement("div");

    messageElement.className =
        "message ai streaming";

    const messageContent =
        document.createElement("div");

    messageContent.className =
        "message-content";

    const cursor =
        document.createElement("span");

    cursor.className =
        "streaming-cursor";

    cursor.setAttribute(
        "aria-hidden",
        "true"
    );

    messageContent.appendChild(cursor);
    messageElement.appendChild(messageContent);
    chatMessages.appendChild(messageElement);

    scrollChatToBottom();

    return messageElement;
}


/**
 * Updates the visible assistant message while new
 * chunks are being received.
 */
function updateStreamingMessage(
    assistantMessageContent,
    completeResponse
) {
    if (!assistantMessageContent) {
        return;
    }

    renderAssistantMarkdown(
        assistantMessageContent,
        completeResponse,
        true
    );

    scrollChatToBottom();
}


/**
 * Converts assistant text into safe rendered Markdown.
 *
 * Part 7 will add advanced sanitization, code-copy
 * buttons and Markdown configuration.
 */
function renderAssistantMarkdown(
    messageContent,
    content,
    showCursor = false
) {
    if (!messageContent) {
        return;
    }

    if (
        typeof marked !== "undefined" &&
        typeof marked.parse === "function"
    ) {
        messageContent.innerHTML =
            marked.parse(content || "");
    } else {
        messageContent.textContent =
            content || "";
    }

    if (showCursor) {
        const cursor =
            document.createElement("span");

        cursor.className =
            "streaming-cursor";

        cursor.setAttribute(
            "aria-hidden",
            "true"
        );

        messageContent.appendChild(cursor);
    }
}


/**
 * Stops the active streaming request.
 */
function stopAssistantResponse() {
    if (
        !appState.isStreaming ||
        !activeStreamController
    ) {
        return;
    }

    activeStreamController.abort();
}


/**
 * Keeps a partially generated response when the
 * user stops generation.
 */
function handleStoppedStream({
    assistantMessageElement,
    assistantMessageContent,
    assistantResponse,
    conversationId
}) {
    const partialResponse =
        assistantResponse.trim();

    assistantMessageElement?.classList.remove(
        "streaming"
    );

    if (!partialResponse) {
        assistantMessageElement?.remove();

        showToast?.(
            "Response generation stopped.",
            "info"
        );

        return;
    }

    renderAssistantMarkdown(
        assistantMessageContent,
        partialResponse
    );

    const partialMessage =
        createLocalMessage({
            role: "assistant",
            content: partialResponse,
            conversationId
        });

    partialMessage.wasStopped = true;

    addMessageToState(partialMessage);

    addTemporaryCopyButton(
        assistantMessageElement,
        partialResponse
    );

    updateEmptyChatState();

    showToast?.(
        "Response generation stopped.",
        "info"
    );
}


/**
 * Displays a helpful message when streaming fails.
 */
function handleStreamingError({
    assistantMessageElement,
    assistantMessageContent,
    assistantResponse,
    error
}) {
    const partialResponse =
        assistantResponse.trim();

    assistantMessageElement?.classList.remove(
        "streaming"
    );

    if (partialResponse) {
        renderAssistantMarkdown(
            assistantMessageContent,
            partialResponse
        );

        const errorNotice =
            document.createElement("p");

        errorNotice.className =
            "stream-error-message";

        errorNotice.textContent =
            "The response was interrupted.";

        assistantMessageContent?.appendChild(
            errorNotice
        );

        return;
    }

    if (assistantMessageContent) {
        assistantMessageContent.textContent =
            error.message ||
            "The assistant could not generate a response.";
    }

    assistantMessageElement?.classList.add(
        "error"
    );
}


/**
 * Adds a basic copy button until the full Markdown and
 * copy-button module is added in Part 7.
 */
function addTemporaryCopyButton(
    messageElement,
    content
) {
    if (!messageElement || !content) {
        return;
    }

    if (
        messageElement.querySelector(
            ".copy-button"
        )
    ) {
        return;
    }

    const copyButton =
        document.createElement("button");

    copyButton.type = "button";
    copyButton.className = "copy-button";
    copyButton.textContent = "📋 Copy";

    copyButton.setAttribute(
        "aria-label",
        "Copy assistant response"
    );

    copyButton.addEventListener(
        "click",
        async () => {
            try {
                await navigator.clipboard.writeText(
                    content
                );

                copyButton.textContent =
                    "✓ Copied";

                window.setTimeout(() => {
                    copyButton.textContent =
                        "📋 Copy";
                }, 1500);

            } catch (error) {
                console.error(
                    "Unable to copy message:",
                    error
                );

                showToast?.(
                    "Unable to copy the response.",
                    "error"
                );
            }
        }
    );

    messageElement.appendChild(copyButton);
}
/* =========================================================
   PART 8: VOICE ASSISTANT
========================================================= */

const VoiceAssistant = {
    recognition: null,
    currentUtterance: null,
    voices: [],

    isSupported: false,
    isListening: false,
    isSpeaking: false,
    autoSpeakEnabled: false,

    language: "en-US",

    voiceButton: null,
    speakerButton: null,
    languageSelect: null,

    initialize() {
        this.voiceButton =
            document.getElementById("voiceButton");

        this.speakerButton =
            document.getElementById("speakerButton");

        this.languageSelect =
            document.getElementById("languageSelect");

        this.initializeSpeechRecognition();
        this.initializeSpeechSynthesis();
        this.connectVoiceControls();
        this.updateVoiceControls();
    },

    initializeSpeechRecognition() {
        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn(
                "Speech recognition is not supported in this browser."
            );

            this.isSupported = false;
            return;
        }

        this.isSupported = true;
        this.recognition = new SpeechRecognition();

        this.recognition.lang = this.language;
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;

        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateVoiceControls();

            showToast?.(
                "Listening...",
                "info"
            );
        };

        this.recognition.onresult = (event) => {
            this.handleRecognitionResult(event);
        };

        this.recognition.onerror = (event) => {
            this.handleRecognitionError(event);
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.updateVoiceControls();
        };
    },

    initializeSpeechSynthesis() {
        if (!("speechSynthesis" in window)) {
            console.warn(
                "Text-to-speech is not supported in this browser."
            );

            return;
        }

        this.loadAvailableVoices();

        window.speechSynthesis.addEventListener(
            "voiceschanged",
            () => {
                this.loadAvailableVoices();
            }
        );
    },

    loadAvailableVoices() {
        this.voices =
            window.speechSynthesis.getVoices();
    },

    connectVoiceControls() {
        this.voiceButton?.addEventListener(
            "click",
            () => {
                this.toggleListening();
            }
        );

        this.speakerButton?.addEventListener(
            "click",
            () => {
                this.toggleAutoSpeak();
            }
        );

        this.languageSelect?.addEventListener(
            "change",
            (event) => {
                this.changeLanguage(
                    event.target.value
                );
            }
        );
    },

    toggleListening() {
        if (!this.isSupported || !this.recognition) {
            showToast?.(
                "Voice recognition is not supported in this browser.",
                "error"
            );

            return;
        }

        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    },

    startListening() {
        if (
            !this.recognition ||
            this.isListening
        ) {
            return;
        }

        try {
            this.stopSpeaking();

            this.recognition.lang =
                this.language;

            this.recognition.start();

        } catch (error) {
            console.error(
                "Unable to start voice recognition:",
                error
            );

            showToast?.(
                "Unable to start the microphone.",
                "error"
            );
        }
    },

    stopListening() {
        if (
            !this.recognition ||
            !this.isListening
        ) {
            return;
        }

        this.recognition.stop();
    },

    handleRecognitionResult(event) {
        let finalTranscript = "";
        let interimTranscript = "";

        for (
            let index = event.resultIndex;
            index < event.results.length;
            index += 1
        ) {
            const transcript =
                event.results[index][0].transcript;

            if (event.results[index].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }

        const transcript =
            finalTranscript ||
            interimTranscript;

        if (!messageInput || !transcript) {
            return;
        }

        messageInput.value =
            transcript.trim();

        autoGrowMessageInput();
        updateSendButtonState();

        if (finalTranscript) {
            messageInput.focus();
        }
    },

    handleRecognitionError(event) {
        this.isListening = false;
        this.updateVoiceControls();

        const errorMessages = {
            "not-allowed":
                "Microphone permission was denied.",

            "service-not-allowed":
                "Voice recognition permission was denied.",

            "no-speech":
                "No speech was detected. Please try again.",

            "audio-capture":
                "No microphone was detected.",

            "network":
                "A network error interrupted voice recognition.",

            "aborted":
                "Voice recognition was stopped."
        };

        const message =
            errorMessages[event.error] ||
            "Voice recognition failed. Please try again.";

        if (event.error !== "aborted") {
            console.error(
                "Voice recognition error:",
                event.error
            );

            showToast?.(
                message,
                "error"
            );
        }
    },

    toggleAutoSpeak() {
        this.autoSpeakEnabled =
            !this.autoSpeakEnabled;

        if (!this.autoSpeakEnabled) {
            this.stopSpeaking();
        }

        this.updateVoiceControls();

        showToast?.(
            this.autoSpeakEnabled
                ? "Voice responses enabled."
                : "Voice responses disabled.",
            "info"
        );
    },

    speak(text) {
        if (
            !text ||
            !("speechSynthesis" in window)
        ) {
            return;
        }

        this.stopSpeaking();

        const cleanText =
            this.prepareTextForSpeech(text);

        if (!cleanText) {
            return;
        }

        const utterance =
            new SpeechSynthesisUtterance(
                cleanText
            );

        utterance.lang =
            this.language;

        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;

        const preferredVoice =
            this.findPreferredVoice();

        if (preferredVoice) {
            utterance.voice =
                preferredVoice;
        }

        utterance.onstart = () => {
            this.isSpeaking = true;
            this.updateVoiceControls();
        };

        utterance.onend = () => {
            this.isSpeaking = false;
            this.currentUtterance = null;
            this.updateVoiceControls();
        };

        utterance.onerror = (event) => {
            this.isSpeaking = false;
            this.currentUtterance = null;
            this.updateVoiceControls();

            if (event.error !== "interrupted") {
                console.error(
                    "Speech synthesis error:",
                    event.error
                );
            }
        };

        this.currentUtterance =
            utterance;

        window.speechSynthesis.speak(
            utterance
        );
    },

    stopSpeaking() {
        if (!("speechSynthesis" in window)) {
            return;
        }

        window.speechSynthesis.cancel();

        this.currentUtterance = null;
        this.isSpeaking = false;

        this.updateVoiceControls();
    },

    findPreferredVoice() {
        if (!this.voices.length) {
            return null;
        }

        const exactMatch =
            this.voices.find((voice) => {
                return voice.lang === this.language;
            });

        if (exactMatch) {
            return exactMatch;
        }

        const languagePrefix =
            this.language.split("-")[0];

        return (
            this.voices.find((voice) => {
                return voice.lang
                    .toLowerCase()
                    .startsWith(
                        languagePrefix.toLowerCase()
                    );
            }) ||
            this.voices[0]
        );
    },

    changeLanguage(language) {
        if (!language) {
            return;
        }

        this.language = language;

        if (this.recognition) {
            this.recognition.lang =
                language;
        }

        this.stopSpeaking();
    },

    prepareTextForSpeech(text) {
        return String(text)
            .replace(/```[\s\S]*?```/g, " Code block omitted. ")
            .replace(/`([^`]+)`/g, "$1")
            .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
            .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
            .replace(/#{1,6}\s*/g, "")
            .replace(/[*_~>]/g, "")
            .replace(/\s+/g, " ")
            .trim();
    },

    speakAssistantMessage(text) {
        if (!this.autoSpeakEnabled) {
            return;
        }

        this.speak(text);
    },

    updateVoiceControls() {
        if (this.voiceButton) {
            this.voiceButton.classList.toggle(
                "listening",
                this.isListening
            );

            this.voiceButton.disabled =
                !this.isSupported;

            this.voiceButton.setAttribute(
                "aria-pressed",
                String(this.isListening)
            );

            this.voiceButton.title =
                this.isListening
                    ? "Stop listening"
                    : "Start voice input";
        }

        if (this.speakerButton) {
            this.speakerButton.classList.toggle(
                "active",
                this.autoSpeakEnabled
            );

            this.speakerButton.classList.toggle(
                "speaking",
                this.isSpeaking
            );

            this.speakerButton.setAttribute(
                "aria-pressed",
                String(this.autoSpeakEnabled)
            );

            this.speakerButton.title =
                this.autoSpeakEnabled
                    ? "Disable voice responses"
                    : "Enable voice responses";
        }
    }
};


/**
 * Makes the voice assistant available to other sections.
 */
function speakAssistantResponse(text) {
    VoiceAssistant.speakAssistantMessage(text);
}


function stopSpeaking() {
    VoiceAssistant.stopSpeaking();
}


function toggleVoiceRecognition() {
    VoiceAssistant.toggleListening();
}


/**
 * Starts the voice feature after the page loads.
 */
document.addEventListener(
    "DOMContentLoaded",
    () => {
        VoiceAssistant.initialize();
    }
);
/* =========================================================
   PART 9: PDF UPLOAD AND RAG
========================================================= */

const PdfRagManager = {
    selectedFile: null,
    uploadedDocuments: [],
    activeDocumentId: null,
    isUploading: false,

    maximumFileSize: 10 * 1024 * 1024,

    uploadEndpoint:
        `${API_BASE_URL}/api/documents/upload`,

    documentsEndpoint:
        `${API_BASE_URL}/api/documents`,

    uploadButton: null,
    fileInput: null,
    dropZone: null,
    selectedFileContainer: null,
    selectedFileName: null,
    selectedFileSize: null,
    removeFileButton: null,
    uploadProgress: null,
    uploadProgressBar: null,
    uploadStatus: null,
    documentList: null,
    documentContextButton: null,

    initialize() {
        this.findElements();
        this.connectEvents();
        this.updateUploadInterface();

        if (isLoggedIn()) {
            this.loadDocuments();
        }
    },

    findElements() {
        this.uploadButton =
            document.getElementById("uploadPdfButton");

        this.fileInput =
            document.getElementById("pdfFileInput");

        this.dropZone =
            document.getElementById("pdfDropZone");

        this.selectedFileContainer =
            document.getElementById("selectedFileContainer");

        this.selectedFileName =
            document.getElementById("selectedFileName");

        this.selectedFileSize =
            document.getElementById("selectedFileSize");

        this.removeFileButton =
            document.getElementById("removeSelectedFile");

        this.uploadProgress =
            document.getElementById("uploadProgress");

        this.uploadProgressBar =
            document.getElementById("uploadProgressBar");

        this.uploadStatus =
            document.getElementById("uploadStatus");

        this.documentList =
            document.getElementById("documentList");

        this.documentContextButton =
            document.getElementById("documentContextButton");
    },

    connectEvents() {
        this.uploadButton?.addEventListener(
            "click",
            () => {
                this.handleUploadButtonClick();
            }
        );

        this.fileInput?.addEventListener(
            "change",
            (event) => {
                const file =
                    event.target.files?.[0];

                this.selectFile(file);
            }
        );

        this.removeFileButton?.addEventListener(
            "click",
            () => {
                this.clearSelectedFile();
            }
        );

        this.dropZone?.addEventListener(
            "click",
            () => {
                this.fileInput?.click();
            }
        );

        this.dropZone?.addEventListener(
            "dragover",
            (event) => {
                event.preventDefault();

                this.dropZone.classList.add(
                    "drag-over"
                );
            }
        );

        this.dropZone?.addEventListener(
            "dragleave",
            () => {
                this.dropZone.classList.remove(
                    "drag-over"
                );
            }
        );

        this.dropZone?.addEventListener(
            "drop",
            (event) => {
                event.preventDefault();

                this.dropZone.classList.remove(
                    "drag-over"
                );

                const file =
                    event.dataTransfer.files?.[0];

                this.selectFile(file);
            }
        );

        this.documentContextButton?.addEventListener(
            "click",
            () => {
                this.toggleDocumentContext();
            }
        );
    },

    handleUploadButtonClick() {
        if (this.isUploading) {
            return;
        }

        if (!this.selectedFile) {
            this.fileInput?.click();
            return;
        }

        this.uploadSelectedFile();
    },

    selectFile(file) {
        if (!file) {
            return;
        }

        const validationResult =
            this.validateFile(file);

        if (!validationResult.valid) {
            this.clearSelectedFile();

            showToast?.(
                validationResult.message,
                "error"
            );

            return;
        }

        this.selectedFile = file;

        this.updateUploadInterface();
    },

    validateFile(file) {
        const fileName =
            file.name.toLowerCase();

        const isPdf =
            file.type === "application/pdf" ||
            fileName.endsWith(".pdf");

        if (!isPdf) {
            return {
                valid: false,
                message:
                    "Please select a valid PDF file."
            };
        }

        if (file.size > this.maximumFileSize) {
            return {
                valid: false,
                message:
                    "The PDF must be smaller than 10 MB."
            };
        }

        if (file.size === 0) {
            return {
                valid: false,
                message:
                    "The selected PDF is empty."
            };
        }

        return {
            valid: true,
            message: ""
        };
    },

    clearSelectedFile() {
        this.selectedFile = null;

        if (this.fileInput) {
            this.fileInput.value = "";
        }

        this.resetProgress();
        this.updateUploadInterface();
    },

    updateUploadInterface() {
        const hasFile =
            Boolean(this.selectedFile);

        if (this.selectedFileContainer) {
            this.selectedFileContainer.hidden =
                !hasFile;
        }

        if (this.selectedFileName) {
            this.selectedFileName.textContent =
                this.selectedFile?.name || "";
        }

        if (this.selectedFileSize) {
            this.selectedFileSize.textContent =
                this.selectedFile
                    ? this.formatFileSize(
                        this.selectedFile.size
                    )
                    : "";
        }

        if (this.uploadButton) {
            this.uploadButton.disabled =
                this.isUploading;

            this.uploadButton.textContent =
                this.isUploading
                    ? "Uploading..."
                    : hasFile
                        ? "Upload PDF"
                        : "Choose PDF";
        }
    },

    async uploadSelectedFile() {
        if (!isLoggedIn()) {
            showToast?.(
                "Please log in before uploading a PDF.",
                "warning"
            );

            return;
        }

        if (!this.selectedFile || this.isUploading) {
            return;
        }

        const formData =
            new FormData();

        formData.append(
            "file",
            this.selectedFile
        );

        if (appState.activeConversationId) {
            formData.append(
                "conversationId",
                appState.activeConversationId
            );
        }

        try {
            this.isUploading = true;

            this.updateUploadInterface();
            this.showProgress();
            this.setUploadStatus(
                "Uploading and processing PDF..."
            );

            const response =
                await this.uploadWithProgress(
                    this.uploadEndpoint,
                    formData
                );

            if (
                response.status === 401 ||
                response.status === 403
            ) {
                clearAuthentication();
                updateAuthenticatedUI();

                throw new Error(
                    "Your session has expired. Please log in again."
                );
            }

            if (
                response.status < 200 ||
                response.status >= 300
            ) {
                throw new Error(
                    this.readUploadError(response)
                );
            }

            const uploadedDocument =
                this.parseUploadResponse(
                    response.responseText
                );

            if (uploadedDocument) {
                this.addDocumentToState(
                    uploadedDocument
                );

                this.activeDocumentId =
                    this.getDocumentId(
                        uploadedDocument
                    );
            }

            this.setProgress(100);

            this.setUploadStatus(
                "PDF processed successfully."
            );

            this.renderDocumentList();

            showToast?.(
                "PDF uploaded and processed successfully.",
                "success"
            );

            window.setTimeout(() => {
                this.clearSelectedFile();
            }, 800);

        } catch (error) {
            console.error(
                "PDF upload failed:",
                error
            );

            this.setUploadStatus(
                error.message ||
                "Unable to upload the PDF."
            );

            showToast?.(
                error.message ||
                "Unable to upload the PDF.",
                "error"
            );

        } finally {
            this.isUploading = false;
            this.updateUploadInterface();
        }
    },

    uploadWithProgress(url, formData) {
        return new Promise(
            (resolve, reject) => {
                const request =
                    new XMLHttpRequest();

                request.open(
                    "POST",
                    url,
                    true
                );

                const token =
                    getToken();

                if (token) {
                    request.setRequestHeader(
                        "Authorization",
                        `Bearer ${token}`
                    );
                }

                request.setRequestHeader(
                    "Accept",
                    "application/json"
                );

                request.upload.addEventListener(
                    "progress",
                    (event) => {
                        if (!event.lengthComputable) {
                            return;
                        }

                        const progress =
                            Math.round(
                                (
                                    event.loaded /
                                    event.total
                                ) * 100
                            );

                        this.setProgress(progress);
                    }
                );

                request.addEventListener(
                    "load",
                    () => {
                        resolve(request);
                    }
                );

                request.addEventListener(
                    "error",
                    () => {
                        reject(
                            new Error(
                                "A network error interrupted the upload."
                            )
                        );
                    }
                );

                request.addEventListener(
                    "abort",
                    () => {
                        reject(
                            new Error(
                                "The PDF upload was cancelled."
                            )
                        );
                    }
                );

                request.send(formData);
            }
        );
    },

    readUploadError(request) {
        try {
            const data =
                JSON.parse(
                    request.responseText
                );

            return (
                data.message ||
                data.error ||
                `Upload failed with status ${request.status}.`
            );

        } catch {
            return (
                request.responseText ||
                `Upload failed with status ${request.status}.`
            );
        }
    },

    parseUploadResponse(responseText) {
        if (!responseText) {
            return null;
        }

        try {
            const data =
                JSON.parse(responseText);

            return (
                data.document ||
                data.pdf ||
                data.data ||
                data
            );

        } catch {
            return null;
        }
    },

    async loadDocuments() {
        try {
            const response =
                await fetch(
                    this.documentsEndpoint,
                    {
                        method: "GET",
                        headers: getAuthHeaders()
                    }
                );

            if (
                response.status === 401 ||
                response.status === 403
            ) {
                return;
            }

            if (!response.ok) {
                throw new Error(
                    await readApiError(response)
                );
            }

            const data =
                await response.json();

            this.uploadedDocuments =
                this.normalizeDocumentList(data);

            this.renderDocumentList();

        } catch (error) {
            console.warn(
                "Unable to load uploaded documents:",
                error
            );
        }
    },

    normalizeDocumentList(data) {
        if (Array.isArray(data)) {
            return data;
        }

        if (Array.isArray(data?.documents)) {
            return data.documents;
        }

        if (Array.isArray(data?.content)) {
            return data.content;
        }

        if (Array.isArray(data?.data)) {
            return data.data;
        }

        return [];
    },

    addDocumentToState(document) {
        if (!document) {
            return;
        }

        const documentId =
            this.getDocumentId(document);

        const existingIndex =
            this.uploadedDocuments.findIndex(
                (item) => {
                    return (
                        String(
                            this.getDocumentId(item)
                        ) ===
                        String(documentId)
                    );
                }
            );

        if (existingIndex >= 0) {
            this.uploadedDocuments[
                existingIndex
            ] = document;

            return;
        }

        this.uploadedDocuments.unshift(
            document
        );
    },

    getDocumentId(document) {
        return (
            document?.id ??
            document?.documentId ??
            document?.pdfId ??
            null
        );
    },

    getDocumentName(document) {
        return (
            document?.fileName ??
            document?.filename ??
            document?.name ??
            document?.title ??
            "Uploaded PDF"
        );
    },

    renderDocumentList() {
        if (!this.documentList) {
            return;
        }

        this.documentList.innerHTML = "";

        if (!this.uploadedDocuments.length) {
            const emptyState =
                document.createElement("p");

            emptyState.className =
                "empty-documents";

            emptyState.textContent =
                "No PDFs uploaded yet.";

            this.documentList.appendChild(
                emptyState
            );

            return;
        }

        const fragment =
            document.createDocumentFragment();

        this.uploadedDocuments.forEach(
            (documentData) => {
                fragment.appendChild(
                    this.createDocumentElement(
                        documentData
                    )
                );
            }
        );

        this.documentList.appendChild(
            fragment
        );
    },

    createDocumentElement(documentData) {
        const documentId =
            this.getDocumentId(documentData);

        const documentName =
            this.getDocumentName(documentData);

        const item =
            document.createElement("div");

        item.className =
            "document-item";

        item.dataset.documentId =
            documentId;

        const isActive =
            String(this.activeDocumentId) ===
            String(documentId);

        if (isActive) {
            item.classList.add("active");
        }

        const information =
            document.createElement("button");

        information.type = "button";
        information.className =
            "document-information";

        const icon =
            document.createElement("span");

        icon.className =
            "document-icon";

        icon.textContent = "📄";

        const name =
            document.createElement("span");

        name.className =
            "document-name";

        name.textContent =
            documentName;

        name.title =
            documentName;

        information.append(
            icon,
            name
        );

        information.addEventListener(
            "click",
            () => {
                this.selectDocument(
                    documentId
                );
            }
        );

        const deleteButton =
            document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className =
            "document-delete-button";

        deleteButton.textContent = "×";

        deleteButton.title =
            "Delete PDF";

        deleteButton.setAttribute(
            "aria-label",
            `Delete ${documentName}`
        );

        deleteButton.addEventListener(
            "click",
            (event) => {
                event.stopPropagation();

                this.deleteDocument(
                    documentId,
                    documentName
                );
            }
        );

        item.append(
            information,
            deleteButton
        );

        return item;
    },

    selectDocument(documentId) {
        if (!documentId) {
            return;
        }

        if (
            String(this.activeDocumentId) ===
            String(documentId)
        ) {
            this.activeDocumentId = null;

            showToast?.(
                "PDF context disabled.",
                "info"
            );
        } else {
            this.activeDocumentId =
                documentId;

            showToast?.(
                "PDF context enabled.",
                "success"
            );
        }

        this.renderDocumentList();
        this.updateDocumentContextButton();
    },

    toggleDocumentContext() {
        if (!this.uploadedDocuments.length) {
            showToast?.(
                "Upload a PDF before enabling document context.",
                "warning"
            );

            return;
        }

        if (this.activeDocumentId) {
            this.activeDocumentId = null;

            showToast?.(
                "PDF context disabled.",
                "info"
            );
        } else {
            this.activeDocumentId =
                this.getDocumentId(
                    this.uploadedDocuments[0]
                );

            showToast?.(
                "PDF context enabled.",
                "success"
            );
        }

        this.renderDocumentList();
        this.updateDocumentContextButton();
    },

    updateDocumentContextButton() {
        if (!this.documentContextButton) {
            return;
        }

        const isActive =
            Boolean(this.activeDocumentId);

        this.documentContextButton.classList.toggle(
            "active",
            isActive
        );

        this.documentContextButton.setAttribute(
            "aria-pressed",
            String(isActive)
        );

        this.documentContextButton.title =
            isActive
                ? "Disable PDF context"
                : "Enable PDF context";
    },

    async deleteDocument(
        documentId,
        documentName
    ) {
        const confirmed =
            window.confirm(
                `Delete "${documentName}"?`
            );

        if (!confirmed) {
            return;
        }

        try {
            const response =
                await fetch(
                    `${this.documentsEndpoint}/${documentId}`,
                    {
                        method: "DELETE",
                        headers: getAuthHeaders()
                    }
                );

            if (
                !response.ok &&
                response.status !== 204
            ) {
                throw new Error(
                    await readApiError(response)
                );
            }

            this.uploadedDocuments =
                this.uploadedDocuments.filter(
                    (documentData) => {
                        return (
                            String(
                                this.getDocumentId(
                                    documentData
                                )
                            ) !==
                            String(documentId)
                        );
                    }
                );

            if (
                String(this.activeDocumentId) ===
                String(documentId)
            ) {
                this.activeDocumentId = null;
            }

            this.renderDocumentList();
            this.updateDocumentContextButton();

            showToast?.(
                "PDF deleted successfully.",
                "success"
            );

        } catch (error) {
            console.error(
                "Unable to delete PDF:",
                error
            );

            showToast?.(
                error.message ||
                "Unable to delete the PDF.",
                "error"
            );
        }
    },

    getActiveDocumentId() {
        return this.activeDocumentId;
    },

    getChatRequestContext() {
        if (!this.activeDocumentId) {
            return {};
        }

        return {
            documentId:
                this.activeDocumentId,

            useDocumentContext:
                true
        };
    },

    showProgress() {
        if (this.uploadProgress) {
            this.uploadProgress.hidden =
                false;
        }

        this.setProgress(0);
    },

    resetProgress() {
        this.setProgress(0);

        if (this.uploadProgress) {
            this.uploadProgress.hidden =
                true;
        }

        this.setUploadStatus("");
    },

    setProgress(value) {
        const safeValue =
            Math.max(
                0,
                Math.min(100, value)
            );

        if (this.uploadProgressBar) {
            this.uploadProgressBar.style.width =
                `${safeValue}%`;

            this.uploadProgressBar.setAttribute(
                "aria-valuenow",
                String(safeValue)
            );
        }
    },

    setUploadStatus(message) {
        if (!this.uploadStatus) {
            return;
        }

        this.uploadStatus.textContent =
            message || "";
    },

    formatFileSize(bytes) {
        if (!Number.isFinite(bytes)) {
            return "";
        }

        if (bytes < 1024) {
            return `${bytes} bytes`;
        }

        const kilobytes =
            bytes / 1024;

        if (kilobytes < 1024) {
            return `${kilobytes.toFixed(1)} KB`;
        }

        const megabytes =
            kilobytes / 1024;

        return `${megabytes.toFixed(1)} MB`;
    }
};


/**
 * Makes the active PDF context available
 * to the chat streaming section.
 */
function getActivePdfContext() {
    return PdfRagManager.getChatRequestContext();
}


/**
 * Starts PDF and RAG functionality.
 */
document.addEventListener(
    "DOMContentLoaded",
    () => {
        PdfRagManager.initialize();
    }
);
/* =========================================================
   PART 10: UTILITIES, TOASTS AND ERROR HANDLING
========================================================= */

const AppUtilities = {
    toastContainer: null,
    loadingOverlay: null,
    loadingMessage: null,

    initialize() {
        this.createToastContainer();
        this.findLoadingElements();
        this.connectGlobalErrorHandlers();
    },

    createToastContainer() {
        this.toastContainer =
            document.getElementById("toastContainer");

        if (this.toastContainer) {
            return;
        }

        this.toastContainer =
            document.createElement("div");

        this.toastContainer.id =
            "toastContainer";

        this.toastContainer.className =
            "toast-container";

        this.toastContainer.setAttribute(
            "aria-live",
            "polite"
        );

        this.toastContainer.setAttribute(
            "aria-atomic",
            "true"
        );

        document.body.appendChild(
            this.toastContainer
        );
    },

    findLoadingElements() {
        this.loadingOverlay =
            document.getElementById(
                "loadingOverlay"
            );

        this.loadingMessage =
            document.getElementById(
                "loadingMessage"
            );
    },

    showToast(
        message,
        type = "info",
        duration = 3500
    ) {
        if (!message) {
            return;
        }

        if (!this.toastContainer) {
            this.createToastContainer();
        }

        const validTypes = [
            "success",
            "error",
            "warning",
            "info"
        ];

        const toastType =
            validTypes.includes(type)
                ? type
                : "info";

        const toast =
            document.createElement("div");

        toast.className =
            `toast toast-${toastType}`;

        toast.setAttribute(
            "role",
            toastType === "error"
                ? "alert"
                : "status"
        );

        const icon =
            document.createElement("span");

        icon.className =
            "toast-icon";

        icon.textContent =
            this.getToastIcon(toastType);

        const content =
            document.createElement("div");

        content.className =
            "toast-content";

        const messageElement =
            document.createElement("p");

        messageElement.className =
            "toast-message";

        messageElement.textContent =
            String(message);

        content.appendChild(
            messageElement
        );

        const closeButton =
            document.createElement("button");

        closeButton.type = "button";
        closeButton.className =
            "toast-close";

        closeButton.textContent = "×";

        closeButton.setAttribute(
            "aria-label",
            "Close notification"
        );

        closeButton.addEventListener(
            "click",
            () => {
                this.removeToast(toast);
            }
        );

        toast.append(
            icon,
            content,
            closeButton
        );

        this.toastContainer.appendChild(
            toast
        );

        requestAnimationFrame(() => {
            toast.classList.add("show");
        });

        const timeoutId =
            window.setTimeout(() => {
                this.removeToast(toast);
            }, duration);

        toast.dataset.timeoutId =
            String(timeoutId);

        return toast;
    },

    removeToast(toast) {
        if (!toast) {
            return;
        }

        const timeoutId =
            Number(toast.dataset.timeoutId);

        if (timeoutId) {
            window.clearTimeout(
                timeoutId
            );
        }

        toast.classList.remove("show");
        toast.classList.add("hide");

        window.setTimeout(() => {
            toast.remove();
        }, 250);
    },

    getToastIcon(type) {
        const icons = {
            success: "✓",
            error: "!",
            warning: "⚠",
            info: "i"
        };

        return icons[type] || "i";
    },

    showLoading(message = "Loading...") {
        if (!this.loadingOverlay) {
            return;
        }

        if (this.loadingMessage) {
            this.loadingMessage.textContent =
                message;
        }

        this.loadingOverlay.hidden =
            false;

        this.loadingOverlay.classList.add(
            "active"
        );

        document.body.classList.add(
            "loading-active"
        );
    },

    hideLoading() {
        if (!this.loadingOverlay) {
            return;
        }

        this.loadingOverlay.classList.remove(
            "active"
        );

        document.body.classList.remove(
            "loading-active"
        );

        window.setTimeout(() => {
            if (
                !this.loadingOverlay.classList.contains(
                    "active"
                )
            ) {
                this.loadingOverlay.hidden =
                    true;
            }
        }, 200);
    },

    connectGlobalErrorHandlers() {
        window.addEventListener(
            "unhandledrejection",
            (event) => {
                console.error(
                    "Unhandled promise rejection:",
                    event.reason
                );
            }
        );

        window.addEventListener(
            "error",
            (event) => {
                console.error(
                    "Application error:",
                    event.error ||
                    event.message
                );
            }
        );
    }
};


/**
 * Displays a notification message.
 */
function showToast(
    message,
    type = "info",
    duration = 3500
) {
    return AppUtilities.showToast(
        message,
        type,
        duration
    );
}


/**
 * Displays the global loading overlay.
 */
function showLoading(
    message = "Loading..."
) {
    AppUtilities.showLoading(message);
}


/**
 * Hides the global loading overlay.
 */
function hideLoading() {
    AppUtilities.hideLoading();
}


/**
 * Pauses execution for a specified time.
 */
function delay(milliseconds) {
    return new Promise((resolve) => {
        window.setTimeout(
            resolve,
            milliseconds
        );
    });
}


/**
 * Prevents a function from running too frequently.
 */
function debounce(
    callback,
    wait = 300
) {
    let timeoutId = null;

    return function debouncedFunction(
        ...args
    ) {
        window.clearTimeout(
            timeoutId
        );

        timeoutId =
            window.setTimeout(() => {
                callback.apply(
                    this,
                    args
                );
            }, wait);
    };
}


/**
 * Limits how often a function can run.
 */
function throttle(
    callback,
    wait = 300
) {
    let isWaiting = false;
    let pendingArgs = null;

    return function throttledFunction(
        ...args
    ) {
        if (isWaiting) {
            pendingArgs = args;
            return;
        }

        callback.apply(
            this,
            args
        );

        isWaiting = true;

        window.setTimeout(() => {
            isWaiting = false;

            if (pendingArgs) {
                const argsToRun =
                    pendingArgs;

                pendingArgs = null;

                callback.apply(
                    this,
                    argsToRun
                );
            }
        }, wait);
    };
}


/**
 * Safely parses JSON.
 */
function safeJsonParse(
    value,
    fallback = null
) {
    if (typeof value !== "string") {
        return fallback;
    }

    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
}


/**
 * Safely saves a value in local storage.
 */
function setLocalStorageItem(
    key,
    value
) {
    if (!key) {
        return false;
    }

    try {
        const storedValue =
            typeof value === "string"
                ? value
                : JSON.stringify(value);

        localStorage.setItem(
            key,
            storedValue
        );

        return true;

    } catch (error) {
        console.warn(
            "Unable to save local storage item:",
            error
        );

        return false;
    }
}


/**
 * Safely reads a local storage value.
 */
function getLocalStorageItem(
    key,
    fallback = null
) {
    if (!key) {
        return fallback;
    }

    try {
        const value =
            localStorage.getItem(key);

        return value ?? fallback;

    } catch (error) {
        console.warn(
            "Unable to read local storage item:",
            error
        );

        return fallback;
    }
}


/**
 * Safely removes a local storage value.
 */
function removeLocalStorageItem(key) {
    if (!key) {
        return;
    }

    try {
        localStorage.removeItem(key);

    } catch (error) {
        console.warn(
            "Unable to remove local storage item:",
            error
        );
    }
}


/**
 * Formats a date for the user.
 */
function formatDateTime(value) {
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

    return new Intl.DateTimeFormat(
        undefined,
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    ).format(date);
}


/**
 * Formats a relative time.
 *
 * Examples:
 * Just now
 * 5 minutes ago
 * Yesterday
 */
function formatRelativeTime(value) {
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
        Date.now() - date.getTime();

    const seconds =
        Math.floor(
            difference / 1000
        );

    if (seconds < 10) {
        return "Just now";
    }

    if (seconds < 60) {
        return `${seconds} seconds ago`;
    }

    const minutes =
        Math.floor(
            seconds / 60
        );

    if (minutes < 60) {
        return `${minutes} ${
            minutes === 1
                ? "minute"
                : "minutes"
        } ago`;
    }

    const hours =
        Math.floor(
            minutes / 60
        );

    if (hours < 24) {
        return `${hours} ${
            hours === 1
                ? "hour"
                : "hours"
        } ago`;
    }

    const days =
        Math.floor(
            hours / 24
        );

    if (days === 1) {
        return "Yesterday";
    }

    if (days < 7) {
        return `${days} days ago`;
    }

    return formatDateTime(date);
}


/**
 * Truncates long text.
 */
function truncateText(
    value,
    maximumLength = 50
) {
    const text =
        String(value || "").trim();

    if (
        text.length <= maximumLength
    ) {
        return text;
    }

    return `${text
        .slice(0, maximumLength)
        .trim()}...`;
}


/**
 * Converts text into a URL-safe slug.
 */
function createSlug(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}


/**
 * Checks whether the device is using a mobile screen.
 */
function isMobileScreen() {
    return window.matchMedia(
        "(max-width: 768px)"
    ).matches;
}


/**
 * Checks whether the user prefers reduced motion.
 */
function prefersReducedMotion() {
    return window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;
}


/**
 * Scrolls an element into view safely.
 */
function scrollElementIntoView(
    element,
    options = {}
) {
    if (!element) {
        return;
    }

    element.scrollIntoView({
        behavior:
            prefersReducedMotion()
                ? "auto"
                : "smooth",

        block:
            options.block || "nearest",

        inline:
            options.inline || "nearest"
    });
}


/**
 * Creates a reusable HTML element.
 */
function createElement(
    tagName,
    options = {}
) {
    const element =
        document.createElement(tagName);

    if (options.className) {
        element.className =
            options.className;
    }

    if (
        options.text !== undefined
    ) {
        element.textContent =
            options.text;
    }

    if (
        options.html !== undefined
    ) {
        element.innerHTML =
            options.html;
    }

    if (options.attributes) {
        Object.entries(
            options.attributes
        ).forEach(
            ([name, value]) => {
                if (
                    value !== null &&
                    value !== undefined
                ) {
                    element.setAttribute(
                        name,
                        String(value)
                    );
                }
            }
        );
    }

    if (options.dataset) {
        Object.entries(
            options.dataset
        ).forEach(
            ([name, value]) => {
                if (
                    value !== null &&
                    value !== undefined
                ) {
                    element.dataset[name] =
                        String(value);
                }
            }
        );
    }

    return element;
}


/**
 * Disables a button while an async operation runs.
 */
async function runWithButtonLoading(
    button,
    callback,
    loadingText = "Please wait..."
) {
    if (
        !button ||
        typeof callback !== "function"
    ) {
        return null;
    }

    const originalText =
        button.textContent;

    const wasDisabled =
        button.disabled;

    button.disabled = true;
    button.classList.add("loading");
    button.textContent = loadingText;

    try {
        return await callback();

    } finally {
        button.disabled =
            wasDisabled;

        button.classList.remove(
            "loading"
        );

        button.textContent =
            originalText;
    }
}


/**
 * Retries an asynchronous request.
 */
async function retryAsync(
    callback,
    options = {}
) {
    const {
        attempts = 3,
        delayMilliseconds = 700
    } = options;

    let lastError = null;

    for (
        let attempt = 1;
        attempt <= attempts;
        attempt += 1
    ) {
        try {
            return await callback(attempt);

        } catch (error) {
            lastError = error;

            if (attempt < attempts) {
                await delay(
                    delayMilliseconds * attempt
                );
            }
        }
    }

    throw lastError;
}


/**
 * Returns a readable message from an error.
 */
function getErrorMessage(
    error,
    fallback =
        "Something went wrong. Please try again."
) {
    if (!error) {
        return fallback;
    }

    if (
        typeof error === "string"
    ) {
        return error;
    }

    if (
        typeof error.message === "string" &&
        error.message.trim()
    ) {
        return error.message;
    }

    return fallback;
}


/**
 * Checks whether an error was caused by cancellation.
 */
function isAbortError(error) {
    return (
        error?.name === "AbortError" ||
        error?.code === 20
    );
}


/**
 * Handles authentication expiry consistently.
 */
function handleSessionExpiry() {
    clearAuthentication();
    updateAuthenticatedUI();

    showToast(
        "Your session has expired. Please log in again.",
        "error"
    );
}


/**
 * Starts the utility system.
 */
document.addEventListener(
    "DOMContentLoaded",
    () => {
        AppUtilities.initialize();
    }
);
/* =========================================================
   PART 11: THEME AND SETTINGS
========================================================= */

const SettingsManager = {
    themeButton: null,
    settingsButton: null,
    settingsModal: null,
    closeSettingsButton: null,
    themeSelect: null,
    fontSizeSelect: null,
    autoSpeakToggle: null,
    saveSettingsButton: null,
    resetSettingsButton: null,

    settings: {
        theme: "system",
        fontSize: "medium",
        autoSpeakResponses: false
    },

    storageKey: "aiAssistantSettings",

    initialize() {
        this.findElements();
        this.loadSettings();
        this.applySettings();
        this.connectEvents();
        this.updateSettingsInterface();
        this.listenForSystemThemeChanges();
    },

    findElements() {
        this.themeButton =
            document.getElementById("themeButton");

        this.settingsButton =
            document.getElementById("settingsButton");

        this.settingsModal =
            document.getElementById("settingsModal");

        this.closeSettingsButton =
            document.getElementById("closeSettingsButton");

        this.themeSelect =
            document.getElementById("themeSelect");

        this.fontSizeSelect =
            document.getElementById("fontSizeSelect");

        this.autoSpeakToggle =
            document.getElementById("autoSpeakToggle");

        this.saveSettingsButton =
            document.getElementById("saveSettingsButton");

        this.resetSettingsButton =
            document.getElementById("resetSettingsButton");
    },

    connectEvents() {
        this.themeButton?.addEventListener(
            "click",
            () => {
                this.toggleTheme();
            }
        );

        this.settingsButton?.addEventListener(
            "click",
            () => {
                this.openSettings();
            }
        );

        this.closeSettingsButton?.addEventListener(
            "click",
            () => {
                this.closeSettings();
            }
        );

        this.settingsModal?.addEventListener(
            "click",
            (event) => {
                if (
                    event.target ===
                    this.settingsModal
                ) {
                    this.closeSettings();
                }
            }
        );

        this.themeSelect?.addEventListener(
            "change",
            (event) => {
                this.settings.theme =
                    event.target.value;

                this.applyTheme(
                    this.settings.theme
                );
            }
        );

        this.fontSizeSelect?.addEventListener(
            "change",
            (event) => {
                this.settings.fontSize =
                    event.target.value;

                this.applyFontSize(
                    this.settings.fontSize
                );
            }
        );

        this.autoSpeakToggle?.addEventListener(
            "change",
            (event) => {
                this.settings.autoSpeakResponses =
                    event.target.checked;

                this.applyVoiceSetting();
            }
        );

        this.saveSettingsButton?.addEventListener(
            "click",
            () => {
                this.saveSettings();
            }
        );

        this.resetSettingsButton?.addEventListener(
            "click",
            () => {
                this.resetSettings();
            }
        );

        document.addEventListener(
            "keydown",
            (event) => {
                if (
                    event.key === "Escape" &&
                    this.isSettingsOpen()
                ) {
                    this.closeSettings();
                }
            }
        );
    },

    loadSettings() {
        const storedSettings =
            getLocalStorageItem(
                this.storageKey
            );

        if (!storedSettings) {
            return;
        }

        const parsedSettings =
            safeJsonParse(
                storedSettings,
                null
            );

        if (!parsedSettings) {
            return;
        }

        this.settings = {
            ...this.settings,
            ...parsedSettings
        };
    },

    saveSettings() {
        setLocalStorageItem(
            this.storageKey,
            this.settings
        );

        this.applySettings();
        this.closeSettings();

        showToast?.(
            "Settings saved successfully.",
            "success"
        );
    },

    resetSettings() {
        const confirmed =
            window.confirm(
                "Reset all settings to default?"
            );

        if (!confirmed) {
            return;
        }

        this.settings = {
            theme: "system",
            fontSize: "medium",
            autoSpeakResponses: false
        };

        removeLocalStorageItem(
            this.storageKey
        );

        this.applySettings();
        this.updateSettingsInterface();

        showToast?.(
            "Settings restored to default.",
            "success"
        );
    },

    applySettings() {
        this.applyTheme(
            this.settings.theme
        );

        this.applyFontSize(
            this.settings.fontSize
        );

        this.applyVoiceSetting();
        this.updateSettingsInterface();
    },

    applyTheme(theme) {
        const validThemes = [
            "light",
            "dark",
            "system"
        ];

        const selectedTheme =
            validThemes.includes(theme)
                ? theme
                : "system";

        this.settings.theme =
            selectedTheme;

        const resolvedTheme =
            selectedTheme === "system"
                ? this.getSystemTheme()
                : selectedTheme;

        document.documentElement.setAttribute(
            "data-theme",
            resolvedTheme
        );

        document.body.classList.toggle(
            "dark-theme",
            resolvedTheme === "dark"
        );

        document.body.classList.toggle(
            "light-theme",
            resolvedTheme === "light"
        );

        this.updateThemeButton(
            resolvedTheme
        );
    },

    toggleTheme() {
        const currentTheme =
            document.documentElement.getAttribute(
                "data-theme"
            ) || this.getSystemTheme();

        const nextTheme =
            currentTheme === "dark"
                ? "light"
                : "dark";

        this.settings.theme =
            nextTheme;

        this.applyTheme(nextTheme);

        setLocalStorageItem(
            this.storageKey,
            this.settings
        );

        this.updateSettingsInterface();

        showToast?.(
            nextTheme === "dark"
                ? "Dark theme enabled."
                : "Light theme enabled.",
            "info"
        );
    },

    getSystemTheme() {
        return window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches
            ? "dark"
            : "light";
    },

    listenForSystemThemeChanges() {
        const systemThemeQuery =
            window.matchMedia(
                "(prefers-color-scheme: dark)"
            );

        systemThemeQuery.addEventListener?.(
            "change",
            () => {
                if (
                    this.settings.theme ===
                    "system"
                ) {
                    this.applyTheme(
                        "system"
                    );
                }
            }
        );
    },

    updateThemeButton(theme) {
        if (!this.themeButton) {
            return;
        }

        const isDark =
            theme === "dark";

        this.themeButton.textContent =
            isDark
                ? "☀️"
                : "🌙";

        this.themeButton.title =
            isDark
                ? "Switch to light theme"
                : "Switch to dark theme";

        this.themeButton.setAttribute(
            "aria-label",
            this.themeButton.title
        );
    },

    applyFontSize(fontSize) {
        const validFontSizes = [
            "small",
            "medium",
            "large"
        ];

        const selectedFontSize =
            validFontSizes.includes(
                fontSize
            )
                ? fontSize
                : "medium";

        this.settings.fontSize =
            selectedFontSize;

        document.documentElement.setAttribute(
            "data-font-size",
            selectedFontSize
        );

        document.body.classList.remove(
            "font-small",
            "font-medium",
            "font-large"
        );

        document.body.classList.add(
            `font-${selectedFontSize}`
        );
    },

    applyVoiceSetting() {
        if (
            typeof VoiceAssistant ===
            "undefined"
        ) {
            return;
        }

        VoiceAssistant.autoSpeakEnabled =
            Boolean(
                this.settings
                    .autoSpeakResponses
            );

        VoiceAssistant.updateVoiceControls();
    },

    updateSettingsInterface() {
        if (this.themeSelect) {
            this.themeSelect.value =
                this.settings.theme;
        }

        if (this.fontSizeSelect) {
            this.fontSizeSelect.value =
                this.settings.fontSize;
        }

        if (this.autoSpeakToggle) {
            this.autoSpeakToggle.checked =
                Boolean(
                    this.settings
                        .autoSpeakResponses
                );
        }
    },

    openSettings() {
        if (!this.settingsModal) {
            return;
        }

        this.settingsModal.hidden =
            false;

        this.settingsModal.classList.add(
            "active"
        );

        this.settingsModal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "modal-open"
        );

        this.updateSettingsInterface();

        window.setTimeout(() => {
            this.closeSettingsButton?.focus();
        }, 50);
    },

    closeSettings() {
        if (!this.settingsModal) {
            return;
        }

        this.settingsModal.classList.remove(
            "active"
        );

        this.settingsModal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "modal-open"
        );

        window.setTimeout(() => {
            if (
                !this.settingsModal.classList.contains(
                    "active"
                )
            ) {
                this.settingsModal.hidden =
                    true;
            }
        }, 200);

        this.settingsButton?.focus();
    },

    isSettingsOpen() {
        return Boolean(
            this.settingsModal &&
            this.settingsModal.classList.contains(
                "active"
            )
        );
    }
};


/**
 * Returns the active theme.
 */
function getCurrentTheme() {
    return (
        document.documentElement.getAttribute(
            "data-theme"
        ) || "light"
    );
}


/**
 * Changes the application theme.
 */
function changeTheme(theme) {
    SettingsManager.settings.theme =
        theme;

    SettingsManager.applyTheme(theme);

    setLocalStorageItem(
        SettingsManager.storageKey,
        SettingsManager.settings
    );
}


/**
 * Opens the settings modal.
 */
function openSettings() {
    SettingsManager.openSettings();
}


/**
 * Closes the settings modal.
 */
function closeSettings() {
    SettingsManager.closeSettings();
}


/**
 * Starts the theme and settings system.
 */
document.addEventListener(
    "DOMContentLoaded",
    () => {
        SettingsManager.initialize();
    }
);
/* =========================================================
   PART 12: FINAL APP INITIALIZATION
========================================================= */

const ApplicationManager = {
    isInitialized: false,
    isOnline: navigator.onLine,

    async initialize() {
        if (this.isInitialized) {
            return;
        }

        this.isInitialized = true;

        try {
            this.setInitialPageState();
            this.connectGlobalEvents();
            this.restoreUserSession();
            this.prepareMessageInput();
            this.synchronizeApplicationSettings();

            await this.loadAuthenticatedApplicationData();

            this.showApplication();

            console.log(
                "AI Personal Assistant initialized successfully."
            );

        } catch (error) {
            console.error(
                "Application initialization failed:",
                error
            );

            this.showApplication();

            showToast?.(
                getErrorMessage?.(
                    error,
                    "The application could not be initialized completely."
                ) ||
                "The application could not be initialized completely.",
                "error"
            );
        }
    },

    setInitialPageState() {
        document.documentElement.classList.add(
            "app-initializing"
        );

        document.body.classList.add(
            "app-loading"
        );

        this.updateConnectionStatus();
    },

    showApplication() {
        document.documentElement.classList.remove(
            "app-initializing"
        );

        document.documentElement.classList.add(
            "app-ready"
        );

        document.body.classList.remove(
            "app-loading"
        );

        document.body.classList.add(
            "app-loaded"
        );

        hideLoading?.();
    },

    restoreUserSession() {
        const authenticated =
            typeof isLoggedIn === "function"
                ? isLoggedIn()
                : Boolean(
                    typeof getToken === "function"
                        ? getToken()
                        : null
                );

        if (
            authenticated &&
            typeof updateAuthenticatedUI ===
                "function"
        ) {
            updateAuthenticatedUI();
            return;
        }

        if (
            !authenticated &&
            typeof clearAuthentication ===
                "function"
        ) {
            clearAuthentication();
        }

        if (
            typeof updateAuthenticatedUI ===
            "function"
        ) {
            updateAuthenticatedUI();
        }
    },

    async loadAuthenticatedApplicationData() {
        const authenticated =
            typeof isLoggedIn === "function" &&
            isLoggedIn();

        if (!authenticated) {
            this.showWelcomeState();
            return;
        }

        const loadingTasks = [];

        if (
            typeof loadConversations ===
            "function"
        ) {
            loadingTasks.push(
                this.runInitializationTask(
                    "conversations",
                    () => loadConversations()
                )
            );
        } else if (
            typeof ConversationManager !==
                "undefined" &&
            typeof ConversationManager
                .loadConversations ===
                "function"
        ) {
            loadingTasks.push(
                this.runInitializationTask(
                    "conversations",
                    () =>
                        ConversationManager
                            .loadConversations()
                )
            );
        }

        if (
            typeof PdfRagManager !==
                "undefined" &&
            typeof PdfRagManager.loadDocuments ===
                "function"
        ) {
            loadingTasks.push(
                this.runInitializationTask(
                    "documents",
                    () =>
                        PdfRagManager
                            .loadDocuments()
                )
            );
        }

        await Promise.allSettled(
            loadingTasks
        );

        this.restoreActiveConversation();
    },

    async runInitializationTask(
        taskName,
        callback
    ) {
        try {
            return await callback();

        } catch (error) {
            console.warn(
                `Unable to initialize ${taskName}:`,
                error
            );

            return null;
        }
    },

    restoreActiveConversation() {
        const savedConversationId =
            getLocalStorageItem?.(
                "activeConversationId",
                null
            ) || null;

        if (
            savedConversationId &&
            typeof appState !==
                "undefined"
        ) {
            appState.activeConversationId =
                savedConversationId;
        }

        if (
            savedConversationId &&
            typeof loadConversationMessages ===
                "function"
        ) {
            loadConversationMessages(
                savedConversationId
            ).catch?.((error) => {
                console.warn(
                    "Unable to restore the active conversation:",
                    error
                );
            });

            return;
        }

        this.showWelcomeState();
    },

    showWelcomeState() {
        const welcomeState =
            document.getElementById(
                "welcomeState"
            );

        if (welcomeState) {
            welcomeState.hidden = false;
        }

        const chatMessages =
            document.getElementById(
                "chatMessages"
            ) ||
            document.getElementById(
                "messagesContainer"
            ) ||
            document.getElementById(
                "chatBody"
            );

        if (
            chatMessages &&
            chatMessages.children.length === 0
        ) {
            chatMessages.classList.add(
                "empty"
            );
        }
    },

    prepareMessageInput() {
        const input =
            typeof messageInput !==
                "undefined"
                ? messageInput
                : document.getElementById(
                    "messageInput"
                ) ||
                document.getElementById(
                    "userInput"
                );

        if (!input) {
            return;
        }

        input.setAttribute(
            "autocomplete",
            "off"
        );

        input.setAttribute(
            "spellcheck",
            "true"
        );

        input.setAttribute(
            "aria-label",
            "Message your AI assistant"
        );

        if (
            typeof autoGrowMessageInput ===
            "function"
        ) {
            autoGrowMessageInput();
        }

        if (
            typeof updateSendButtonState ===
            "function"
        ) {
            updateSendButtonState();
        }

        input.addEventListener(
            "input",
            () => {
                if (
                    typeof autoGrowMessageInput ===
                    "function"
                ) {
                    autoGrowMessageInput();
                }

                if (
                    typeof updateSendButtonState ===
                    "function"
                ) {
                    updateSendButtonState();
                }
            }
        );

        input.addEventListener(
            "keydown",
            (event) => {
                if (
                    event.key === "Escape"
                ) {
                    input.blur();
                }
            }
        );
    },

    synchronizeApplicationSettings() {
        if (
            typeof SettingsManager !==
                "undefined" &&
            typeof SettingsManager
                .applySettings ===
                "function"
        ) {
            SettingsManager.applySettings();
        }

        if (
            typeof PdfRagManager !==
                "undefined" &&
            typeof PdfRagManager
                .updateDocumentContextButton ===
                "function"
        ) {
            PdfRagManager
                .updateDocumentContextButton();
        }

        if (
            typeof VoiceAssistant !==
                "undefined" &&
            typeof VoiceAssistant
                .updateVoiceControls ===
                "function"
        ) {
            VoiceAssistant
                .updateVoiceControls();
        }
    },

    connectGlobalEvents() {
        window.addEventListener(
            "online",
            () => {
                this.isOnline = true;
                this.updateConnectionStatus();

                showToast?.(
                    "Internet connection restored.",
                    "success"
                );
            }
        );

        window.addEventListener(
            "offline",
            () => {
                this.isOnline = false;
                this.updateConnectionStatus();

                showToast?.(
                    "You are offline. Some features may not work.",
                    "warning",
                    5000
                );
            }
        );

        window.addEventListener(
            "beforeunload",
            () => {
                this.saveApplicationState();
                this.stopActiveProcesses();
            }
        );

        document.addEventListener(
            "visibilitychange",
            () => {
                if (document.hidden) {
                    this.saveApplicationState();
                }
            }
        );

        document.addEventListener(
            "keydown",
            (event) => {
                this.handleKeyboardShortcut(
                    event
                );
            }
        );
    },

    handleKeyboardShortcut(event) {
        const controlKey =
            event.ctrlKey ||
            event.metaKey;

        if (
            controlKey &&
            event.key.toLowerCase() ===
                "k"
        ) {
            event.preventDefault();

            const input =
                typeof messageInput !==
                    "undefined"
                    ? messageInput
                    : document.getElementById(
                        "messageInput"
                    ) ||
                    document.getElementById(
                        "userInput"
                    );

            input?.focus();
        }

        if (
            controlKey &&
            event.key.toLowerCase() ===
                "n"
        ) {
            event.preventDefault();

            if (
                typeof createNewConversation ===
                "function"
            ) {
                createNewConversation();
            } else if (
                typeof ConversationManager !==
                    "undefined" &&
                typeof ConversationManager
                    .createConversation ===
                    "function"
            ) {
                ConversationManager
                    .createConversation();
            }
        }

        if (
            controlKey &&
            event.key === ","
        ) {
            event.preventDefault();

            openSettings?.();
        }
    },

    updateConnectionStatus() {
        document.body.classList.toggle(
            "offline",
            !this.isOnline
        );

        document.body.classList.toggle(
            "online",
            this.isOnline
        );

        const connectionStatus =
            document.getElementById(
                "connectionStatus"
            );

        if (!connectionStatus) {
            return;
        }

        connectionStatus.textContent =
            this.isOnline
                ? "Online"
                : "Offline";

        connectionStatus.classList.toggle(
            "online",
            this.isOnline
        );

        connectionStatus.classList.toggle(
            "offline",
            !this.isOnline
        );
    },

    saveApplicationState() {
        if (
            typeof appState ===
            "undefined"
        ) {
            return;
        }

        if (
            appState.activeConversationId
        ) {
            setLocalStorageItem?.(
                "activeConversationId",
                appState.activeConversationId
            );
        } else {
            removeLocalStorageItem?.(
                "activeConversationId"
            );
        }

        if (
            typeof PdfRagManager !==
                "undefined" &&
            PdfRagManager.activeDocumentId
        ) {
            setLocalStorageItem?.(
                "activeDocumentId",
                PdfRagManager
                    .activeDocumentId
            );
        }
    },

    stopActiveProcesses() {
        if (
            typeof VoiceAssistant !==
                "undefined"
        ) {
            VoiceAssistant
                .stopListening?.();

            VoiceAssistant
                .stopSpeaking?.();
        }

        if (
            typeof appState !==
                "undefined" &&
            appState.streamController
        ) {
            appState.streamController.abort?.();
        }

        if (
            typeof currentStreamController !==
                "undefined" &&
            currentStreamController
        ) {
            currentStreamController.abort?.();
        }
    }
};


/**
 * Returns the final request context used when
 * sending a message to the backend.
 */
function getApplicationRequestContext() {
    const requestContext = {};

    if (
        typeof appState !==
            "undefined" &&
        appState.activeConversationId
    ) {
        requestContext.conversationId =
            appState.activeConversationId;
    }

    if (
        typeof getActivePdfContext ===
        "function"
    ) {
        Object.assign(
            requestContext,
            getActivePdfContext()
        );
    }

    return requestContext;
}


/**
 * Saves the currently selected conversation.
 */
function saveActiveConversationState(
    conversationId
) {
    if (
        typeof appState !==
        "undefined"
    ) {
        appState.activeConversationId =
            conversationId || null;
    }

    if (conversationId) {
        setLocalStorageItem?.(
            "activeConversationId",
            conversationId
        );
    } else {
        removeLocalStorageItem?.(
            "activeConversationId"
        );
    }
}


/**
 * Resets the application after logout.
 */
function resetApplicationAfterLogout() {
    ApplicationManager.stopActiveProcesses();

    removeLocalStorageItem?.(
        "activeConversationId"
    );

    removeLocalStorageItem?.(
        "activeDocumentId"
    );

    if (
        typeof appState !==
        "undefined"
    ) {
        appState.activeConversationId =
            null;
    }

    if (
        typeof PdfRagManager !==
        "undefined"
    ) {
        PdfRagManager.activeDocumentId =
            null;

        PdfRagManager.uploadedDocuments =
            [];

        PdfRagManager
            .renderDocumentList?.();

        PdfRagManager
            .updateDocumentContextButton?.();
    }

    const messageContainer =
        document.getElementById(
            "chatMessages"
        ) ||
        document.getElementById(
            "messagesContainer"
        ) ||
        document.getElementById(
            "chatBody"
        );

    if (messageContainer) {
        messageContainer.innerHTML = "";
    }

    ApplicationManager.showWelcomeState();
}


/**
 * Starts the complete application after
 * the HTML document is ready.
 */
function startApplication() {
    ApplicationManager.initialize();
}


if (
    document.readyState === "loading"
) {
    document.addEventListener(
        "DOMContentLoaded",
        startApplication,
        {
            once: true
        }
    );
} else {
    startApplication();
}