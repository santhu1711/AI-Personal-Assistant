# 🤖 AI Personal Assistant

![Java](https://img.shields.io/badge/Java-21-red?style=for-the-badge&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen?style=for-the-badge&logo=springboot)
![MySQL](https://img.shields.io/badge/MySQL-8-blue?style=for-the-badge&logo=mysql)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange?style=for-the-badge)
![OpenRouter](https://img.shields.io/badge/OpenRouter-AI-purple?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-orange?style=for-the-badge&logo=html5)
![CSS3](https://img.shields.io/badge/CSS3-blue?style=for-the-badge&logo=css3)
![JavaScript](https://img.shields.io/badge/JavaScript-yellow?style=for-the-badge&logo=javascript)
![License](https://img.shields.io/badge/License-MIT-success?style=for-the-badge)

A full-stack AI Personal Assistant built using Java, Spring Boot, MySQL, JWT Authentication, OpenRouter AI, and PDF RAG.

This project provides an intelligent AI assistant capable of chatting with users, answering questions from uploaded PDF documents, maintaining conversation history, collecting user feedback, and offering an admin dashboard for analytics.

---

# ✨ Features

## Authentication

- User Registration
- User Login
- JWT Authentication
- Role-Based Access (Admin/User)
- Remember Me
- Secure Password Storage

---

## AI Chat

- AI Conversation
- Chat History
- Multiple Conversations
- Rename Conversations
- Delete Conversations
- Regenerate AI Responses

---

## PDF RAG

- Upload PDF Documents
- Extract PDF Text
- Intelligent Context Retrieval
- Ask Questions about Uploaded PDFs
- Context-aware AI Responses

---

## Dashboard

- Beautiful Modern UI
- Responsive Design
- Conversation Sidebar
- User Profile
- Theme Support

---

## Feedback System

- 5-Star Rating
- User Suggestions
- Bug Reports
- Feedback Analytics

---

## Admin Dashboard

- Total Users
- Active Users
- Total Feedback
- Average Rating
- Rating Distribution
- User Management

---

# 🛠 Tech Stack

## Frontend

- HTML5
- CSS3
- JavaScript

## Backend

- Java
- Spring Boot
- Spring Security
- Spring Data JPA
- Maven

## Database

- MySQL

## AI

- OpenRouter API
- GPT-4o Mini

## Authentication

- JWT

## PDF Processing

- Apache PDFBox

---

# 📂 Project Structure

```
AI-CHAT-WIDGET

├── frontend
│ ├── css
│ ├── js
│ ├── login.html
│ ├── register.html
│ ├── dashboard.html
│ └── admin-dashboard.html
│
├── backend
│ ├── controller
│ ├── service
│ ├── repository
│ ├── entity
│ ├── dto
│ ├── security
│ └── config
│
└── README.md
```

---

# 🚀 Features Implemented

- Authentication System
- JWT Security
- AI Chat
- Conversation History
- PDF RAG
- Feedback Module
- Admin Dashboard
- User Analytics
- Role-Based Authorization
- Responsive UI

---

# 📸 Screenshots

## Home Page

![Home Page](screenshots/home-page.png)

---

## Login Page

![Login](screenshots/login-page.png)

---

## Register Page

![Register](screenshots/register-page.png)

---

## User Dashboard

![Dashboard](screenshots/dashboard.png)

---

## PDF RAG

![PDF RAG](screenshots/pdf-rag.png)

---

## Feedback System

![Feedback](screenshots/feedback.png)

---

## Admin Dashboard

![Admin Dashboard](screenshots/admin-dashboard.png)
# 🏗️ System Architecture

```mermaid
flowchart TD

    A[User Browser] --> B[Frontend<br/>HTML, CSS, JavaScript]

    B --> C[Spring Boot REST API]

    C --> D[JWT Authentication]
    C --> E[MySQL Database]
    C --> F[OpenRouter AI API]
    C --> G[PDF RAG Engine]

    G --> H[PDF Text Extraction]
    H --> I[Document Chunking]
    I --> J[Relevant Context Retrieval]
    J --> F

    C --> K[Feedback System]
    C --> L[Admin Dashboard APIs]

    E --> M[Users]
    E --> N[Conversations]
    E --> O[Messages]
    E --> P[Documents]
    E --> Q[Document Chunks]
    E --> R[Feedback]
    
# 🌐 Deployment

Frontend:
- (Coming Soon)

Backend:
- (Coming Soon)

---

# 👨‍💻 Developer

**Santhosh S**

Java Backend Developer

GitHub:
https://github.com/santhu1711

LinkedIn:
https://www.linkedin.com/in/santhosh17/

---

# ⭐ Version

Version 1.0

Built with ❤️ using Java & Spring Boot.