"use strict";

/* ==========================================================
   AI PERSONAL ASSISTANT
   LOGIN PAGE
========================================================== */

const LoginPage = {

    form: null,

    emailInput: null,
    passwordInput: null,

    togglePasswordButton: null,
    rememberMeCheckbox: null,

    loginButton: null,
    loginButtonText: null,
    loginSpinner: null,

    loginMessage: null,
    forgotPasswordLink: null,

    initialize() {

        this.findElements();

        this.attachEvents();

        this.restoreRememberedEmail();

        this.redirectAuthenticatedUser();
    },

    findElements() {

        this.form =
            document.getElementById(
                "loginForm"
            );

        this.emailInput =
            document.getElementById(
                "email"
            );

        this.passwordInput =
            document.getElementById(
                "password"
            );

        this.togglePasswordButton =
            document.getElementById(
                "togglePassword"
            );

        this.rememberMeCheckbox =
            document.getElementById(
                "rememberMe"
            );

        this.loginButton =
            document.getElementById(
                "loginButton"
            );

        this.loginButtonText =
            document.getElementById(
                "loginButtonText"
            );

        this.loginSpinner =
            document.getElementById(
                "loginSpinner"
            );

        this.loginMessage =
            document.getElementById(
                "loginMessage"
            );

        this.forgotPasswordLink =
            document.getElementById(
                "forgotPasswordLink"
            );
    },

    attachEvents() {

        /* Events will be added in Part 4 */

    },

    restoreRememberedEmail() {

        const rememberedEmail =
            localStorage.getItem(
                "rememberedEmail"
            );

        if (
            rememberedEmail &&
            this.emailInput
        ) {

            this.emailInput.value =
                rememberedEmail;

            if (
                this.rememberMeCheckbox
            ) {

                this.rememberMeCheckbox.checked =
                    true;
            }
        }
    },

    redirectAuthenticatedUser() {

        const token =
            localStorage.getItem(
                "jwtToken"
            );

        if (token) {

            window.location.href =
                "dashboard.html";
        }
    }

};


document.addEventListener(

    "DOMContentLoaded",

    () => {

        LoginPage.initialize();

    }

);
/* ==========================================================
   PART 2: VALIDATION FUNCTIONS
========================================================== */

LoginPage.getTrimmedValue = function (input) {
    return input?.value?.trim() || "";
};


LoginPage.isValidEmail = function (email) {
    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(email);
};


LoginPage.showFieldError = function (
    input,
    errorElementId,
    message
) {
    const errorElement =
        document.getElementById(
            errorElementId
        );

    input?.classList.add(
        "input-error"
    );

    if (errorElement) {
        errorElement.textContent =
            message;
    }
};


LoginPage.clearFieldError = function (
    input,
    errorElementId
) {
    const errorElement =
        document.getElementById(
            errorElementId
        );

    input?.classList.remove(
        "input-error"
    );

    if (errorElement) {
        errorElement.textContent = "";
    }
};


LoginPage.clearAllErrors = function () {
    this.clearFieldError(
        this.emailInput,
        "emailError"
    );

    this.clearFieldError(
        this.passwordInput,
        "passwordError"
    );
};


LoginPage.validateEmail = function () {
    const email =
        this.getTrimmedValue(
            this.emailInput
        );

    this.clearFieldError(
        this.emailInput,
        "emailError"
    );

    if (!email) {
        this.showFieldError(
            this.emailInput,
            "emailError",
            "Email address is required."
        );

        return false;
    }

    if (!this.isValidEmail(email)) {
        this.showFieldError(
            this.emailInput,
            "emailError",
            "Enter a valid email address."
        );

        return false;
    }

    return true;
};


LoginPage.validatePassword = function () {
    const password =
        this.passwordInput?.value || "";

    this.clearFieldError(
        this.passwordInput,
        "passwordError"
    );

    if (!password) {
        this.showFieldError(
            this.passwordInput,
            "passwordError",
            "Password is required."
        );

        return false;
    }

    if (password.length < 6) {
        this.showFieldError(
            this.passwordInput,
            "passwordError",
            "Password must contain at least 6 characters."
        );

        return false;
    }

    return true;
};


LoginPage.validateForm = function () {
    this.clearAllErrors();

    const isEmailValid =
        this.validateEmail();

    const isPasswordValid =
        this.validatePassword();

    return (
        isEmailValid &&
        isPasswordValid
    );
};
/* ==========================================================
   PART 3: PASSWORD TOGGLE, API CALL AND JWT STORAGE
========================================================== */

LoginPage.apiUrl =
    "http://localhost:8080/api/auth/login";


LoginPage.togglePasswordVisibility = function () {
    if (
        !this.passwordInput ||
        !this.togglePasswordButton
    ) {
        return;
    }

    const passwordIsHidden =
        this.passwordInput.type === "password";

    this.passwordInput.type =
        passwordIsHidden
            ? "text"
            : "password";

    this.togglePasswordButton.textContent =
        passwordIsHidden
            ? "🙈"
            : "👁";

    this.togglePasswordButton.setAttribute(
        "aria-label",
        passwordIsHidden
            ? "Hide password"
            : "Show password"
    );

    this.togglePasswordButton.title =
        passwordIsHidden
            ? "Hide password"
            : "Show password";
};


LoginPage.showMessage = function (
    message,
    type = "info"
) {
    if (!this.loginMessage) {
        return;
    }

    this.loginMessage.textContent =
        message;

    this.loginMessage.className =
        `auth-message show ${type}`;
};


LoginPage.clearMessage = function () {
    if (!this.loginMessage) {
        return;
    }

    this.loginMessage.textContent = "";

    this.loginMessage.className =
        "auth-message";
};


LoginPage.setLoadingState = function (
    loading
) {
    if (this.loginButton) {
        this.loginButton.disabled =
            loading;

        this.loginButton.classList.toggle(
            "loading",
            loading
        );
    }

    if (this.loginButtonText) {
        this.loginButtonText.textContent =
            loading
                ? "Signing In..."
                : "Sign In";
    }

    if (this.emailInput) {
        this.emailInput.disabled =
            loading;
    }

    if (this.passwordInput) {
        this.passwordInput.disabled =
            loading;
    }

    if (this.rememberMeCheckbox) {
        this.rememberMeCheckbox.disabled =
            loading;
    }

    if (this.togglePasswordButton) {
        this.togglePasswordButton.disabled =
            loading;
    }
};


LoginPage.createRequestBody = function () {
    return {
        email:
            this.getTrimmedValue(
                this.emailInput
            ),

        password:
            this.passwordInput?.value || ""
    };
};


LoginPage.readApiResponse = async function (
    response
) {
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

    const responseText =
        await response.text();

    return {
        message:
            responseText
    };
};


LoginPage.getApiErrorMessage = function (
    responseData,
    status
) {

    if (status === 401) {
        return "Invalid email or password.";
    }

    if (status === 400) {
        return (
            responseData?.message ||
            "Email and password are required."
        );
    }

    return (
        responseData?.message ||
        responseData?.details ||
        responseData?.error ||
        "Unable to sign in."
    );
};


LoginPage.loginUser = async function () {
    const response =
        await fetch(
            this.apiUrl,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    "Accept":
                        "application/json"
                },

                body:
                    JSON.stringify(
                        this.createRequestBody()
                    )
            }
        );

    const responseData =
        await this.readApiResponse(
            response
        );

    if (!response.ok) {
       throw new Error(
    this.getApiErrorMessage(
        responseData,
        response.status
    )
);
    }

    return responseData;
};


LoginPage.extractToken = function (
    responseData
) {
    return (
        responseData?.token ||
        responseData?.jwtToken ||
        responseData?.accessToken ||
        responseData?.jwt ||
        null
    );
};


LoginPage.storeAuthentication = function (
    responseData
) {
    const token =
        this.extractToken(
            responseData
        );

    if (!token) {
        throw new Error(
            "Login succeeded, but no authentication token was returned."
        );
    }

    localStorage.setItem(
        "jwtToken",
        token
    );

    const userData =
        responseData?.user || {
            id:
                responseData?.id ||
                responseData?.userId ||
                null,

            name:
                responseData?.name ||
                responseData?.username ||
                responseData?.email ||
                "User",

            email:
                responseData?.email ||
                this.getTrimmedValue(
                    this.emailInput
                )
        };

    localStorage.setItem(
        "currentUser",
        JSON.stringify(
            userData
        )
    );

    if (
        this.rememberMeCheckbox?.checked
    ) {
        localStorage.setItem(
            "rememberedEmail",
            this.getTrimmedValue(
                this.emailInput
            )
        );
    } else {
        localStorage.removeItem(
            "rememberedEmail"
        );
    }
};


LoginPage.handleSuccessfulLogin =
    function (responseData) {

        this.storeAuthentication(
            responseData
        );

        this.showMessage(
            "Login successful. Redirecting to your dashboard...",
            "success"
        );

        window.setTimeout(
            () => {
                window.location.href =
                    "dashboard.html";
            },
            1200
        );
    };


LoginPage.handleLoginError =
    function (error) {

        console.error(
            "Login error:",
            error
        );

        this.showMessage(
            error?.message ||
            "Unable to sign in. Please check your details and try again.",
            "error"
        );
    };
    /* ==========================================================
   PART 4: FORM SUBMISSION AND EVENT LISTENERS
========================================================== */

LoginPage.handleSubmit = async function (
    event
) {
    event.preventDefault();

    this.clearMessage();

    const formIsValid =
        this.validateForm();

    if (!formIsValid) {
        this.showMessage(
            "Please correct the highlighted fields.",
            "error"
        );

        return;
    }

    try {
        this.setLoadingState(true);

        const responseData =
            await this.loginUser();

        this.handleSuccessfulLogin(
            responseData
        );

    } catch (error) {
        this.handleLoginError(
            error
        );

    } finally {
        this.setLoadingState(false);
    }
};


LoginPage.handleForgotPassword = function (
    event
) {
    event.preventDefault();

    this.showMessage(
        "Forgot-password support will be added in a later version.",
        "info"
    );
};


LoginPage.attachEvents = function () {

    this.form?.addEventListener(
        "submit",
        (event) => {
            this.handleSubmit(event);
        }
    );


    this.togglePasswordButton?.addEventListener(
        "click",
        () => {
            this.togglePasswordVisibility();
        }
    );


    this.forgotPasswordLink?.addEventListener(
        "click",
        (event) => {
            this.handleForgotPassword(
                event
            );
        }
    );


    this.emailInput?.addEventListener(
        "blur",
        () => {
            this.validateEmail();
        }
    );


    this.passwordInput?.addEventListener(
        "blur",
        () => {
            this.validatePassword();
        }
    );


    this.emailInput?.addEventListener(
        "input",
        () => {
            this.clearFieldError(
                this.emailInput,
                "emailError"
            );

            this.clearMessage();
        }
    );


    this.passwordInput?.addEventListener(
        "input",
        () => {
            this.clearFieldError(
                this.passwordInput,
                "passwordError"
            );

            this.clearMessage();
        }
    );
};