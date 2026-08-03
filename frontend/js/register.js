"use strict";

/* ==========================================================
   AI PERSONAL ASSISTANT
   REGISTER PAGE
========================================================== */

const RegisterPage = {

    form: null,

    firstNameInput: null,
    lastNameInput: null,
    emailInput: null,

    passwordInput: null,
    confirmPasswordInput: null,

    passwordToggle: null,
    confirmPasswordToggle: null,

    termsCheckbox: null,

    registerButton: null,
    buttonLoader: null,

    formMessage: null,

    initialize() {

        this.findElements();

        this.attachEvents();
    },

    findElements() {

        this.form =
            document.getElementById("registerForm");

        this.firstNameInput =
            document.getElementById("firstName");

        this.lastNameInput =
            document.getElementById("lastName");

        this.emailInput =
            document.getElementById("email");

        this.passwordInput =
            document.getElementById("password");

        this.confirmPasswordInput =
            document.getElementById("confirmPassword");

        this.passwordToggle =
            document.getElementById("passwordToggle");

        this.confirmPasswordToggle =
            document.getElementById("confirmPasswordToggle");

        this.termsCheckbox =
            document.getElementById("terms");

        this.registerButton =
            document.getElementById("registerButton");

        this.buttonLoader =
            document.getElementById("buttonLoader");

        this.formMessage =
            document.getElementById("formMessage");
    },

    attachEvents() {

        /* Part 4 */

    }

};

document.addEventListener(

    "DOMContentLoaded",

    () => {

        RegisterPage.initialize();

    }

);
/* ==========================================================
   PART 2: VALIDATION FUNCTIONS
========================================================== */

RegisterPage.getTrimmedValue = function (input) {
    return input?.value?.trim() || "";
};


RegisterPage.isValidEmail = function (email) {
    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(email);
};


RegisterPage.isValidName = function (name) {
    const namePattern =
        /^[A-Za-z][A-Za-z\s'-]{1,49}$/;

    return namePattern.test(name);
};


RegisterPage.isStrongPassword = function (password) {
    const hasMinimumLength =
        password.length >= 8;

    const hasLetter =
        /[A-Za-z]/.test(password);

    const hasNumber =
        /\d/.test(password);

    return (
        hasMinimumLength &&
        hasLetter &&
        hasNumber
    );
};


RegisterPage.showFieldError = function (
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


RegisterPage.clearFieldError = function (
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


RegisterPage.clearAllErrors = function () {
    this.clearFieldError(
        this.firstNameInput,
        "firstNameError"
    );

    this.clearFieldError(
        this.lastNameInput,
        "lastNameError"
    );

    this.clearFieldError(
        this.emailInput,
        "emailError"
    );

    this.clearFieldError(
        this.passwordInput,
        "passwordError"
    );

    this.clearFieldError(
        this.confirmPasswordInput,
        "confirmPasswordError"
    );

    const termsError =
        document.getElementById(
            "termsError"
        );

    if (termsError) {
        termsError.textContent = "";
    }
};


RegisterPage.validateFirstName = function () {
    const firstName =
        this.getTrimmedValue(
            this.firstNameInput
        );

    this.clearFieldError(
        this.firstNameInput,
        "firstNameError"
    );

    if (!firstName) {
        this.showFieldError(
            this.firstNameInput,
            "firstNameError",
            "First name is required."
        );

        return false;
    }

    if (!this.isValidName(firstName)) {
        this.showFieldError(
            this.firstNameInput,
            "firstNameError",
            "Enter a valid first name."
        );

        return false;
    }

    return true;
};


RegisterPage.validateLastName = function () {
    const lastName =
        this.getTrimmedValue(
            this.lastNameInput
        );

    this.clearFieldError(
        this.lastNameInput,
        "lastNameError"
    );

    if (!lastName) {
        this.showFieldError(
            this.lastNameInput,
            "lastNameError",
            "Last name is required."
        );

        return false;
    }

    if (!this.isValidName(lastName)) {
        this.showFieldError(
            this.lastNameInput,
            "lastNameError",
            "Enter a valid last name."
        );

        return false;
    }

    return true;
};


RegisterPage.validateEmail = function () {
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


RegisterPage.validatePassword = function () {
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

    if (!this.isStrongPassword(password)) {
        this.showFieldError(
            this.passwordInput,
            "passwordError",
            "Use at least 8 characters with letters and numbers."
        );

        return false;
    }

    return true;
};


RegisterPage.validateConfirmPassword = function () {
    const password =
        this.passwordInput?.value || "";

    const confirmPassword =
        this.confirmPasswordInput?.value || "";

    this.clearFieldError(
        this.confirmPasswordInput,
        "confirmPasswordError"
    );

    if (!confirmPassword) {
        this.showFieldError(
            this.confirmPasswordInput,
            "confirmPasswordError",
            "Please confirm your password."
        );

        return false;
    }

    if (password !== confirmPassword) {
        this.showFieldError(
            this.confirmPasswordInput,
            "confirmPasswordError",
            "Passwords do not match."
        );

        return false;
    }

    return true;
};


RegisterPage.validateTerms = function () {
    const termsError =
        document.getElementById(
            "termsError"
        );

    if (termsError) {
        termsError.textContent = "";
    }

    if (!this.termsCheckbox?.checked) {
        if (termsError) {
            termsError.textContent =
                "Please accept the terms and privacy policy.";
        }

        return false;
    }

    return true;
};


RegisterPage.validateForm = function () {
    this.clearAllErrors();

    const isFirstNameValid =
        this.validateFirstName();

    const isLastNameValid =
        this.validateLastName();

    const isEmailValid =
        this.validateEmail();

    const isPasswordValid =
        this.validatePassword();

    const isConfirmPasswordValid =
        this.validateConfirmPassword();

    const areTermsAccepted =
        this.validateTerms();

    return (
        isFirstNameValid &&
        isLastNameValid &&
        isEmailValid &&
        isPasswordValid &&
        isConfirmPasswordValid &&
        areTermsAccepted
    );
};
/* ==========================================================
   PART 3: PASSWORD TOGGLE, API CALL AND LOADING STATE
========================================================== */

RegisterPage.apiUrl =
    "http://localhost:8080/api/auth/register";


RegisterPage.togglePasswordVisibility = function (
    input,
    button
) {
    if (!input || !button) {
        return;
    }

    const passwordIsHidden =
        input.type === "password";

    input.type =
        passwordIsHidden
            ? "text"
            : "password";

    button.textContent =
        passwordIsHidden
            ? "Hide"
            : "Show";

    button.setAttribute(
        "aria-label",
        passwordIsHidden
            ? "Hide password"
            : "Show password"
    );
};


RegisterPage.showFormMessage = function (
    message,
    type = "info"
) {
    if (!this.formMessage) {
        return;
    }

    this.formMessage.textContent =
        message;

    this.formMessage.className =
        `form-message show ${type}`;
};


RegisterPage.clearFormMessage = function () {
    if (!this.formMessage) {
        return;
    }

    this.formMessage.textContent = "";

    this.formMessage.className =
        "form-message";
};


RegisterPage.setLoadingState = function (
    loading
) {
    if (!this.registerButton) {
        return;
    }

    this.registerButton.disabled =
        loading;

    this.registerButton.classList.toggle(
        "loading",
        loading
    );

    const buttonText =
        this.registerButton.querySelector(
            ".button-text"
        );

    if (buttonText) {
        buttonText.textContent =
            loading
                ? "Creating Account..."
                : "Create Account";
    }

    if (this.firstNameInput) {
        this.firstNameInput.disabled =
            loading;
    }

    if (this.lastNameInput) {
        this.lastNameInput.disabled =
            loading;
    }

    if (this.emailInput) {
        this.emailInput.disabled =
            loading;
    }

    if (this.passwordInput) {
        this.passwordInput.disabled =
            loading;
    }

    if (this.confirmPasswordInput) {
        this.confirmPasswordInput.disabled =
            loading;
    }

    if (this.termsCheckbox) {
        this.termsCheckbox.disabled =
            loading;
    }
};


RegisterPage.createRequestBody = function () {
    const firstName =
        this.getTrimmedValue(
            this.firstNameInput
        );

    const lastName =
        this.getTrimmedValue(
            this.lastNameInput
        );

    return {
        name:
            `${firstName} ${lastName}`.trim(),

        firstName,

        lastName,

        email:
            this.getTrimmedValue(
                this.emailInput
            ),

        password:
            this.passwordInput?.value || ""
    };
};


RegisterPage.readApiResponse = async function (
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


RegisterPage.getApiErrorMessage = function (
    responseData,
    status
) {

    if (status === 409) {
        return "An account already exists with this email address.";
    }

    if (status === 400) {
        return (
            responseData?.message ||
            "Please check the registration details."
        );
    }

    return (
        responseData?.message ||
        responseData?.details ||
        responseData?.error ||
        "Unable to create your account."
    );
};


RegisterPage.registerUser = async function () {
    const requestBody =
        this.createRequestBody();

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
                        requestBody
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


RegisterPage.handleSuccessfulRegistration =
    function (responseData) {

        this.showFormMessage(
            responseData?.message ||
            "Your account was created successfully. Redirecting to login...",
            "success"
        );

        this.form?.reset();

        window.setTimeout(
            () => {
                window.location.href =
                    "login.html";
            },
            1800
        );
    };


RegisterPage.handleRegistrationError =
    function (error) {

        console.error(
            "Registration error:",
            error
        );

        this.showFormMessage(
            error?.message ||
            "Unable to create your account. Please try again.",
            "error"
        );
    };
    /* ==========================================================
   PART 4: FORM SUBMISSION AND EVENT LISTENERS
========================================================== */

RegisterPage.handleSubmit = async function (
    event
) {
    event.preventDefault();

    this.clearFormMessage();

    const formIsValid =
        this.validateForm();

    if (!formIsValid) {
        this.showFormMessage(
            "Please correct the highlighted fields.",
            "error"
        );

        return;
    }

    try {
        this.setLoadingState(true);

        const responseData =
            await this.registerUser();

        this.handleSuccessfulRegistration(
            responseData
        );

    } catch (error) {
        this.handleRegistrationError(
            error
        );

    } finally {
        this.setLoadingState(false);
    }
};


RegisterPage.attachEvents = function () {

    this.form?.addEventListener(
        "submit",
        (event) => {
            this.handleSubmit(event);
        }
    );


    this.passwordToggle?.addEventListener(
        "click",
        () => {
            this.togglePasswordVisibility(
                this.passwordInput,
                this.passwordToggle
            );
        }
    );


    this.confirmPasswordToggle?.addEventListener(
        "click",
        () => {
            this.togglePasswordVisibility(
                this.confirmPasswordInput,
                this.confirmPasswordToggle
            );
        }
    );


    this.firstNameInput?.addEventListener(
        "blur",
        () => {
            this.validateFirstName();
        }
    );


    this.lastNameInput?.addEventListener(
        "blur",
        () => {
            this.validateLastName();
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


    this.confirmPasswordInput?.addEventListener(
        "blur",
        () => {
            this.validateConfirmPassword();
        }
    );


    this.firstNameInput?.addEventListener(
        "input",
        () => {
            this.clearFieldError(
                this.firstNameInput,
                "firstNameError"
            );
        }
    );


    this.lastNameInput?.addEventListener(
        "input",
        () => {
            this.clearFieldError(
                this.lastNameInput,
                "lastNameError"
            );
        }
    );


    this.emailInput?.addEventListener(
        "input",
        () => {
            this.clearFieldError(
                this.emailInput,
                "emailError"
            );
        }
    );


    this.passwordInput?.addEventListener(
        "input",
        () => {
            this.clearFieldError(
                this.passwordInput,
                "passwordError"
            );

            if (
                this.confirmPasswordInput?.value
            ) {
                this.validateConfirmPassword();
            }
        }
    );


    this.confirmPasswordInput?.addEventListener(
        "input",
        () => {
            this.clearFieldError(
                this.confirmPasswordInput,
                "confirmPasswordError"
            );
        }
    );


    this.termsCheckbox?.addEventListener(
        "change",
        () => {
            const termsError =
                document.getElementById(
                    "termsError"
                );

            if (
                termsError &&
                this.termsCheckbox.checked
            ) {
                termsError.textContent = "";
            }
        }
    );
};