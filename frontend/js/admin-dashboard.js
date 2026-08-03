"use strict";

/* ==========================================================
   ADMIN DASHBOARD
========================================================== */

const AdminDashboard = {

    apiBaseUrl:
        "http://localhost:8080/api",

    token:
        null,

    currentAdminEmail:
        "",

    users:
        [],

    feedback:
        [],

    overview:
        null,

    elements:
        {}
};


/* ==========================================================
   ELEMENT CACHE
========================================================== */

AdminDashboard.cacheElements = function () {

    this.elements = {

        navItems:
            document.querySelectorAll(
                ".admin-nav-item"
            ),

        sections:
            document.querySelectorAll(
                ".admin-section"
            ),

        adminName:
            document.getElementById(
                "adminName"
            ),

        adminEmail:
            document.getElementById(
                "adminEmail"
            ),

        adminAvatar:
            document.getElementById(
                "adminAvatar"
            ),

        refreshAdminButton:
            document.getElementById(
                "refreshAdminButton"
            ),

        adminLogoutButton:
            document.getElementById(
                "adminLogoutButton"
            ),

        totalUsersValue:
            document.getElementById(
                "totalUsersValue"
            ),

        activeTodayValue:
            document.getElementById(
                "activeTodayValue"
            ),

        totalFeedbackValue:
            document.getElementById(
                "totalFeedbackValue"
            ),

        averageRatingValue:
            document.getElementById(
                "averageRatingValue"
            ),

        activeTodaySummary:
            document.getElementById(
                "activeTodaySummary"
            ),

        activeWeekValue:
            document.getElementById(
                "activeWeekValue"
            ),

        activeMonthValue:
            document.getElementById(
                "activeMonthValue"
            ),

        fiveStarValue:
            document.getElementById(
                "fiveStarValue"
            ),

        fourStarValue:
            document.getElementById(
                "fourStarValue"
            ),

        threeStarValue:
            document.getElementById(
                "threeStarValue"
            ),

        twoStarValue:
            document.getElementById(
                "twoStarValue"
            ),

        oneStarValue:
            document.getElementById(
                "oneStarValue"
            ),

        fiveStarBar:
            document.getElementById(
                "fiveStarBar"
            ),

        fourStarBar:
            document.getElementById(
                "fourStarBar"
            ),

        threeStarBar:
            document.getElementById(
                "threeStarBar"
            ),

        twoStarBar:
            document.getElementById(
                "twoStarBar"
            ),

        oneStarBar:
            document.getElementById(
                "oneStarBar"
            ),

        adminUsersTableBody:
            document.getElementById(
                "adminUsersTableBody"
            ),

        userSearchInput:
            document.getElementById(
                "userSearchInput"
            ),

        feedbackCards:
            document.getElementById(
                "feedbackCards"
            ),

        feedbackSearchInput:
            document.getElementById(
                "feedbackSearchInput"
            ),

        ratingFilterSelect:
            document.getElementById(
                "ratingFilterSelect"
            ),

        totalLoginCount:
            document.getElementById(
                "totalLoginCount"
            ),

        totalMessageCount:
            document.getElementById(
                "totalMessageCount"
            ),

        totalConversationCount:
            document.getElementById(
                "totalConversationCount"
            ),

        totalPdfUploadCount:
            document.getElementById(
                "totalPdfUploadCount"
            ),

        mostActiveUsersList:
            document.getElementById(
                "mostActiveUsersList"
            ),

        adminWelcomeToast:
            document.getElementById(
                "adminWelcomeToast"
            ),

        adminLoadingOverlay:
            document.getElementById(
                "adminLoadingOverlay"
            )
    };
};


/* ==========================================================
   AUTHENTICATION
========================================================== */

AdminDashboard.getStoredToken = function () {

    const possibleKeys = [
        "jwtToken",
        "token",
        "accessToken",
        "authToken"
    ];

    for (
        const key of possibleKeys
    ) {

        const value =
            localStorage.getItem(
                key
            );

        if (
            value &&
            value.trim()
        ) {

            return value.trim();
        }
    }

    return null;
};


AdminDashboard.decodeJwtPayload = function (
    token
) {

    try {

        const tokenParts =
            token.split(".");

        if (
            tokenParts.length !== 3
        ) {

            return null;
        }

        const base64Url =
            tokenParts[1];

        const base64 =
            base64Url
                .replace(
                    /-/g,
                    "+"
                )
                .replace(
                    /_/g,
                    "/"
                );

        const decoded =
            decodeURIComponent(
                window
                    .atob(base64)
                    .split("")
                    .map(
                        character => {

                            return (
                                "%" +
                                (
                                    "00" +
                                    character
                                        .charCodeAt(0)
                                        .toString(16)
                                ).slice(-2)
                            );
                        }
                    )
                    .join("")
            );

        return JSON.parse(
            decoded
        );

    } catch (error) {

        console.error(
            "JWT decoding failed:",
            error
        );

        return null;
    }
};


AdminDashboard.getAuthHeaders = function () {

    return {

        "Content-Type":
            "application/json",

        "Authorization":
            `Bearer ${this.token}`
    };
};


AdminDashboard.handleUnauthorized = function (
    status
) {

    if (
        status === 401
    ) {

        alert(
            "Your login session has expired. Please log in again."
        );

        this.logout();

        return true;
    }

    if (
        status === 403
    ) {

        alert(
            "You do not have permission to open the Admin Dashboard."
        );

        window.location.href =
            "dashboard.html";

        return true;
    }

    return false;
};


/* ==========================================================
   API UTILITIES
========================================================== */

AdminDashboard.readResponse = async function (
    response
) {

    const text =
        await response.text();

    if (!text) {
        return null;
    }

    try {

        return JSON.parse(
            text
        );

    } catch {

        return text;
    }
};


AdminDashboard.getErrorMessage = function (
    data,
    fallback
) {

    if (
        typeof data === "string" &&
        data.trim()
    ) {

        return data;
    }

    return (
        data?.message ||
        data?.error ||
        fallback
    );
};


AdminDashboard.fetchAdminData = async function (
    endpoint
) {

    const response =
        await fetch(
            `${this.apiBaseUrl}${endpoint}`,
            {
                method:
                    "GET",

                headers:
                    this.getAuthHeaders()
            }
        );

    const data =
        await this.readResponse(
            response
        );

    if (
        this.handleUnauthorized(
            response.status
        )
    ) {

        throw new Error(
            "Unauthorized request"
        );
    }

    if (!response.ok) {

        throw new Error(
            this.getErrorMessage(
                data,
                "Unable to load admin data."
            )
        );
    }

    return data;
};


/* ==========================================================
   LOADING
========================================================== */

AdminDashboard.showLoading = function () {

    if (
        this.elements.adminLoadingOverlay
    ) {

        this.elements.adminLoadingOverlay.hidden =
            false;
    }
};


AdminDashboard.hideLoading = function () {

    if (
        this.elements.adminLoadingOverlay
    ) {

        this.elements.adminLoadingOverlay.hidden =
            true;
    }
};


/* ==========================================================
   PROFILE
========================================================== */

AdminDashboard.updateAdminProfile = function () {

    const currentAdmin =
        this.users.find(
            user =>
                user.email
                    ?.toLowerCase() ===
                this.currentAdminEmail
                    .toLowerCase()
        ) ||
        this.users.find(
            user =>
                user.role === "ADMIN"
        );

    if (!currentAdmin) {
        return;
    }

    const name =
        currentAdmin.name ||
        "Admin";

    const email =
        currentAdmin.email ||
        this.currentAdminEmail;

    this.elements.adminName.textContent =
        name;

    this.elements.adminEmail.textContent =
        email;

    this.elements.adminAvatar.textContent =
        name
            .charAt(0)
            .toUpperCase();
};


/* ==========================================================
   OVERVIEW
========================================================== */

AdminDashboard.renderOverview = function () {

    if (!this.overview) {
        return;
    }

    const data =
        this.overview;

    this.elements.totalUsersValue.textContent =
        data.totalUsers ?? 0;

    this.elements.activeTodayValue.textContent =
        data.activeToday ?? 0;

    this.elements.totalFeedbackValue.textContent =
        data.totalFeedback ?? 0;

    this.elements.averageRatingValue.textContent =
        Number(
            data.averageRating || 0
        ).toFixed(1);

    this.elements.activeTodaySummary.textContent =
        data.activeToday ?? 0;

    this.elements.activeWeekValue.textContent =
        data.activeThisWeek ?? 0;

    this.elements.activeMonthValue.textContent =
        data.activeThisMonth ?? 0;

    this.elements.fiveStarValue.textContent =
        data.fiveStarCount ?? 0;

    this.elements.fourStarValue.textContent =
        data.fourStarCount ?? 0;

    this.elements.threeStarValue.textContent =
        data.threeStarCount ?? 0;

    this.elements.twoStarValue.textContent =
        data.twoStarCount ?? 0;

    this.elements.oneStarValue.textContent =
        data.oneStarCount ?? 0;

    this.renderRatingBars();
};


AdminDashboard.renderRatingBars = function () {

    const totalFeedback =
        Number(
            this.overview?.totalFeedback || 0
        );

    const ratingBars = [
        {
            count:
                this.overview?.fiveStarCount || 0,

            element:
                this.elements.fiveStarBar
        },
        {
            count:
                this.overview?.fourStarCount || 0,

            element:
                this.elements.fourStarBar
        },
        {
            count:
                this.overview?.threeStarCount || 0,

            element:
                this.elements.threeStarBar
        },
        {
            count:
                this.overview?.twoStarCount || 0,

            element:
                this.elements.twoStarBar
        },
        {
            count:
                this.overview?.oneStarCount || 0,

            element:
                this.elements.oneStarBar
        }
    ];

    ratingBars.forEach(
        item => {

            const percentage =
                totalFeedback > 0
                    ?
                    (
                        item.count /
                        totalFeedback
                    ) * 100
                    :
                    0;

            item.element.style.width =
                `${percentage}%`;
        }
    );
};


/* ==========================================================
   DATE FORMATTING
========================================================== */

AdminDashboard.formatDateTime = function (
    dateValue
) {

    if (!dateValue) {
        return "Never";
    }

    const date =
        new Date(
            dateValue
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Unknown";
    }

    return date.toLocaleString(
        "en-IN",
        {
            dateStyle:
                "medium",

            timeStyle:
                "short"
        }
    );
};


/* ==========================================================
   USERS
========================================================== */

AdminDashboard.renderUsers = function (
    users = this.users
) {

    const tableBody =
        this.elements.adminUsersTableBody;

    tableBody.innerHTML =
        "";

    if (
        !users ||
        users.length === 0
    ) {

        tableBody.innerHTML =
            `
            <tr>
                <td
                    colspan="8"
                    class="table-empty-state"
                >
                    No users found.
                </td>
            </tr>
            `;

        return;
    }

    users.forEach(
        user => {

            const row =
                document.createElement(
                    "tr"
                );

            const safeName =
                this.escapeHtml(
                    user.name ||
                    "Unknown User"
                );

            const safeEmail =
                this.escapeHtml(
                    user.email ||
                    ""
                );

            const role =
                this.escapeHtml(
                    user.role ||
                    "USER"
                );

            row.innerHTML =
                `
                <td>
                    <strong>
                        ${safeName}
                    </strong>

                    <small
                        style="
                            display:block;
                            margin-top:4px;
                            color:#939bad;
                        "
                    >
                        ${safeEmail}
                    </small>
                </td>

                <td>
                    ${role}
                </td>

                <td>
                    ${this.formatDateTime(
                        user.lastLoginAt
                    )}
                </td>

                <td>
                    ${this.formatDateTime(
                        user.lastActiveAt
                    )}
                </td>

                <td>
                    ${user.loginCount ?? 0}
                </td>

                <td>
                    ${user.messageCount ?? 0}
                </td>

                <td>
                    ${user.conversationCount ?? 0}
                </td>

                <td>
                    ${user.pdfUploadCount ?? 0}
                </td>
                `;

            tableBody.appendChild(
                row
            );
        }
    );
};


AdminDashboard.filterUsers = function () {

    const searchTerm =
        this.elements
            .userSearchInput
            .value
            .trim()
            .toLowerCase();

    if (!searchTerm) {

        this.renderUsers(
            this.users
        );

        return;
    }

    const filteredUsers =
        this.users.filter(
            user => {

                const searchableText =
                    [
                        user.name,
                        user.email,
                        user.role
                    ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                return searchableText.includes(
                    searchTerm
                );
            }
        );

    this.renderUsers(
        filteredUsers
    );
};


/* ==========================================================
   FEEDBACK
========================================================== */

AdminDashboard.renderFeedback = function (
    feedbackList = this.feedback
) {

    const container =
        this.elements.feedbackCards;

    container.innerHTML =
        "";

    if (
        !feedbackList ||
        feedbackList.length === 0
    ) {

        container.innerHTML =
            `
            <div class="table-empty-state">
                No feedback found.
            </div>
            `;

        return;
    }

    feedbackList.forEach(
        feedback => {

            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "feedback-card";

            const rating =
                Number(
                    feedback.rating || 0
                );

            const stars =
                "★".repeat(rating) +
                "☆".repeat(
                    Math.max(
                        0,
                        5 - rating
                    )
                );

            const suggestion =
                feedback.suggestion
                    ?
                    this.escapeHtml(
                        feedback.suggestion
                    )
                    :
                    "No suggestion provided.";

            const bugReport =
                feedback.bugReport
                    ?
                    this.escapeHtml(
                        feedback.bugReport
                    )
                    :
                    "No bug reported.";

            card.innerHTML =
                `
                <div class="feedback-card-header">

                    <div>

                        <strong>
                            ${this.escapeHtml(
                                feedback.userName ||
                                "Unknown User"
                            )}
                        </strong>

                        <small>
                            ${this.escapeHtml(
                                feedback.userEmail ||
                                ""
                            )}
                        </small>

                    </div>

                    <div class="feedback-rating">
                        ${stars}
                    </div>

                </div>

                <div class="feedback-card-body">

                    <div class="feedback-field">

                        <span>
                            Experience
                        </span>

                        <p>
                            ${this.escapeHtml(
                                feedback.experience ||
                                "Not provided"
                            )}
                        </p>

                    </div>

                    <div class="feedback-field">

                        <span>
                            Suggestion
                        </span>

                        <p>
                            ${suggestion}
                        </p>

                    </div>

                    <div class="feedback-field">

                        <span>
                            Bug Report
                        </span>

                        <p>
                            ${bugReport}
                        </p>

                    </div>

                </div>

                <div class="feedback-card-footer">
                    Submitted:
                    ${this.formatDateTime(
                        feedback.createdAt
                    )}
                </div>
                `;

            container.appendChild(
                card
            );
        }
    );
};


AdminDashboard.filterFeedback = function () {

    const searchTerm =
        this.elements
            .feedbackSearchInput
            .value
            .trim()
            .toLowerCase();

    const selectedRating =
        this.elements
            .ratingFilterSelect
            .value;

    const filteredFeedback =
        this.feedback.filter(
            feedback => {

                const searchableText =
                    [
                        feedback.userName,
                        feedback.userEmail,
                        feedback.experience,
                        feedback.suggestion,
                        feedback.bugReport
                    ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                const matchesSearch =
                    !searchTerm ||
                    searchableText.includes(
                        searchTerm
                    );

                const matchesRating =
                    !selectedRating ||
                    Number(
                        feedback.rating
                    ) ===
                    Number(
                        selectedRating
                    );

                return (
                    matchesSearch &&
                    matchesRating
                );
            }
        );

    this.renderFeedback(
        filteredFeedback
    );
};


/* ==========================================================
   ACTIVITY ANALYTICS
========================================================== */

AdminDashboard.renderAnalytics = function () {

    const totalLogins =
        this.users.reduce(
            (
                total,
                user
            ) =>
                total +
                Number(
                    user.loginCount || 0
                ),
            0
        );

    const totalMessages =
        this.users.reduce(
            (
                total,
                user
            ) =>
                total +
                Number(
                    user.messageCount || 0
                ),
            0
        );

    const totalConversations =
        this.users.reduce(
            (
                total,
                user
            ) =>
                total +
                Number(
                    user.conversationCount || 0
                ),
            0
        );

    const totalPdfUploads =
        this.users.reduce(
            (
                total,
                user
            ) =>
                total +
                Number(
                    user.pdfUploadCount || 0
                ),
            0
        );

    this.elements.totalLoginCount.textContent =
        totalLogins;

    this.elements.totalMessageCount.textContent =
        totalMessages;

    this.elements.totalConversationCount.textContent =
        totalConversations;

    this.elements.totalPdfUploadCount.textContent =
        totalPdfUploads;

    this.renderMostActiveUsers();
};


AdminDashboard.renderMostActiveUsers = function () {

    const container =
        this.elements.mostActiveUsersList;

    container.innerHTML =
        "";

    const sortedUsers =
        [...this.users]
            .sort(
                (
                    firstUser,
                    secondUser
                ) => {

                    return (
                        Number(
                            secondUser.messageCount || 0
                        ) -
                        Number(
                            firstUser.messageCount || 0
                        )
                    );
                }
            )
            .slice(
                0,
                5
            );

    if (
        sortedUsers.length === 0
    ) {

        container.innerHTML =
            `
            <div class="table-empty-state">
                No activity available.
            </div>
            `;

        return;
    }

    sortedUsers.forEach(
        user => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "active-user-item";

            const name =
                user.name ||
                "Unknown User";

            item.innerHTML =
                `
                <div class="active-user-avatar">
                    ${this.escapeHtml(
                        name
                            .charAt(0)
                            .toUpperCase()
                    )}
                </div>

                <div>

                    <strong>
                        ${this.escapeHtml(
                            name
                        )}
                    </strong>

                    <small>
                        ${this.escapeHtml(
                            user.email ||
                            ""
                        )}
                    </small>

                </div>

                <div class="active-user-score">
                    ${user.messageCount ?? 0}
                    messages
                </div>
                `;

            container.appendChild(
                item
            );
        }
    );
};


/* ==========================================================
   SECTION NAVIGATION
========================================================== */

AdminDashboard.showSection = function (
    sectionName
) {

    this.elements.sections.forEach(
        section => {

            const expectedId =
                `${sectionName}Section`;

            const active =
                section.id ===
                expectedId;

            section.hidden =
                !active;

            section.classList.toggle(
                "active",
                active
            );
        }
    );

    this.elements.navItems.forEach(
        navItem => {

            navItem.classList.toggle(
                "active",
                navItem.dataset.section ===
                sectionName
            );
        }
    );
};


/* ==========================================================
   WELCOME TOAST
========================================================== */

AdminDashboard.showWelcomeToast = function () {

    const toast =
        this.elements.adminWelcomeToast;

    if (!toast) {
        return;
    }

    toast.hidden =
        false;

    window.setTimeout(
        () => {

            toast.hidden =
                true;
        },
        3000
    );
};


/* ==========================================================
   HTML SAFETY
========================================================== */

AdminDashboard.escapeHtml = function (
    value
) {

    return String(
        value ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );
};


/* ==========================================================
   DATA LOADING
========================================================== */

AdminDashboard.loadDashboardData = async function () {

    this.showLoading();

    try {

        const [
            overview,
            users,
            feedback
        ] =
            await Promise.all(
                [
                    this.fetchAdminData(
                        "/admin/overview"
                    ),

                    this.fetchAdminData(
                        "/admin/users"
                    ),

                    this.fetchAdminData(
                        "/admin/feedback"
                    )
                ]
            );

        this.overview =
            overview;

        this.users =
            Array.isArray(users)
                ?
                users
                :
                [];

        this.feedback =
            Array.isArray(feedback)
                ?
                feedback
                :
                [];

        this.renderOverview();

        this.renderUsers();

        this.renderFeedback();

        this.renderAnalytics();

        this.updateAdminProfile();

    } catch (error) {

        console.error(
            "Admin dashboard loading error:",
            error
        );

        if (
            error.message !==
            "Unauthorized request"
        ) {

            alert(
                error.message ||
                "Unable to load the Admin Dashboard."
            );
        }

    } finally {

        this.hideLoading();
    }
};


/* ==========================================================
   LOGOUT
========================================================== */

AdminDashboard.logout = function () {

    [
        "jwtToken",
        "token",
        "accessToken",
        "authToken"
    ].forEach(
        key =>
            localStorage.removeItem(
                key
            )
    );

    window.location.href =
        "login.html";
};


/* ==========================================================
   EVENTS
========================================================== */

AdminDashboard.attachEvents = function () {

    this.elements.navItems.forEach(
        navItem => {

            navItem.addEventListener(
                "click",
                () => {

                    this.showSection(
                        navItem.dataset.section
                    );
                }
            );
        }
    );

    this.elements.refreshAdminButton
        ?.addEventListener(
            "click",
            () => {

                this.loadDashboardData();
            }
        );

    this.elements.adminLogoutButton
        ?.addEventListener(
            "click",
            () => {

                const confirmed =
                    window.confirm(
                        "Are you sure you want to log out?"
                    );

                if (confirmed) {

                    this.logout();
                }
            }
        );

    this.elements.userSearchInput
        ?.addEventListener(
            "input",
            () => {

                this.filterUsers();
            }
        );

    this.elements.feedbackSearchInput
        ?.addEventListener(
            "input",
            () => {

                this.filterFeedback();
            }
        );

    this.elements.ratingFilterSelect
        ?.addEventListener(
            "change",
            () => {

                this.filterFeedback();
            }
        );
};


/* ==========================================================
   INITIALIZATION
========================================================== */

AdminDashboard.initialize = async function () {

    this.cacheElements();

    this.token =
        this.getStoredToken();

    if (!this.token) {

        alert(
            "Please log in before opening the Admin Dashboard."
        );

        window.location.href =
            "login.html";

        return;
    }

    const jwtPayload =
        this.decodeJwtPayload(
            this.token
        );

    this.currentAdminEmail =
        jwtPayload?.sub ||
        "";

    this.attachEvents();

    this.showWelcomeToast();

    await this.loadDashboardData();

    console.log(
        "Admin Dashboard initialized successfully."
    );
};


/* ==========================================================
   START
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        AdminDashboard.initialize();
    }
);