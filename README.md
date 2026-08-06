# 🧠 NovaMind – AI Personal Assistant

<p align="center">

![Java](https://img.shields.io/badge/Java-21-red?style=for-the-badge&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen?style=for-the-badge&logo=springboot)
![MySQL](https://img.shields.io/badge/MySQL-8-blue?style=for-the-badge&logo=mysql)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange?style=for-the-badge)
![OpenRouter](https://img.shields.io/badge/OpenRouter-AI-purple?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-orange?style=for-the-badge&logo=html5)
![CSS3](https://img.shields.io/badge/CSS3-blue?style=for-the-badge&logo=css3)
![JavaScript](https://img.shields.io/badge/JavaScript-yellow?style=for-the-badge&logo=javascript)
![License](https://img.shields.io/badge/License-MIT-success?style=for-the-badge)

</p>

---

## 🚀 Live Demo

### 🌐 Frontend

https://ai-personal-assistant-sable.vercel.app

### ⚙️ Backend API

https://ai-personal-assistant-production-2cfc.up.railway.app

---

# 📖 Overview

NovaMind is a production-ready AI Personal Assistant built using **Java**, **Spring Boot**, **MySQL**, **JWT Authentication**, **OpenRouter AI**, and **Retrieval-Augmented Generation (RAG)**.

It provides an intelligent conversational experience with secure authentication, persistent conversations, AI-powered PDF understanding, feedback collection, and an administration dashboard for analytics.

---

# ✨ Features

## 🔐 Authentication

- User Registration
- User Login
- JWT Authentication
- Role-Based Authorization
- Remember Me
- Secure Password Encryption

---

## 🤖 AI Chat

- AI Conversations
- Streaming Responses
- Multiple Conversations
- Persistent Chat History
- Rename Conversations
- Delete Conversations
- Edit Messages
- Regenerate AI Responses
- Markdown Rendering

---

## 📄 PDF RAG

- Upload PDF Documents
- Extract PDF Text
- Intelligent Document Chunking
- Context Retrieval
- Ask Questions About Uploaded PDFs
- Context-Aware AI Responses

---

## 🎤 Voice Features

- Voice Input
- Speech Recognition Support

---

## 🖥 Dashboard

- Modern Responsive UI
- Light & Dark Theme
- Conversation Sidebar
- Conversation Search
- User Profile
- PDF Context Banner

---

## ⭐ Feedback System

- 5-Star Rating
- Suggestions
- Bug Reports
- Automatic Feedback Popup
- Feedback Analytics

---

## 📊 Admin Dashboard

- Total Users
- Active Users
- Total Feedback
- Average Rating
- Rating Distribution
- User Management
- User Activity Statistics

---

# 🛠 Technology Stack

## Frontend

- HTML5
- CSS3
- JavaScript

---

## Backend

- Java 21
- Spring Boot
- Spring Security
- Spring Data JPA
- REST APIs
- Maven

---

## Database

- MySQL

---

## Artificial Intelligence

- OpenRouter API
- GPT Models
- Retrieval-Augmented Generation (RAG)

---

## Authentication

- JWT

---

## PDF Processing

- Apache PDFBox

---

## Deployment

- Railway
- Vercel

---

# 📂 Project Structure

```
AI-Personal-Assistant

├── backend
│
├── controller
├── service
├── repository
├── entity
├── dto
├── security
├── config
│
├── frontend
│
├── css
├── js
├── login.html
├── register.html
├── dashboard.html
├── admin-dashboard.html
│
├── screenshots
│
└── README.md
```

---

# 🚀 Implemented Features

- Authentication System
- JWT Security
- AI Chat
- Streaming Responses
- Conversation History
- Edit Messages
- Regenerate Responses
- PDF RAG
- PDF Upload
- Feedback Module
- Admin Dashboard
- User Analytics
- Role-Based Authorization
- Responsive UI

---

# 📸 Screenshots

## 🏠 Home Page

![Home](screenshots/home-page.png)

---

## 🔑 Login

![Login](screenshots/login-page.png)

---

## 📝 Register

![Register](screenshots/register-page.png)

---

## 💬 Dashboard

![Dashboard](screenshots/dashboard.png)

---

## 📄 PDF Chat

![PDF](screenshots/pdf-rag.png)

---

## ⭐ Feedback

![Feedback](screenshots/feedback.png)

---

## 📊 Admin Dashboard

![Admin](screenshots/admin-dashboard.png)

---

# 🏗 System Architecture

```mermaid
flowchart TD

A[User Browser]

A --> B[Frontend]

B --> C[Spring Boot REST API]

C --> D[JWT Authentication]

C --> E[MySQL]

C --> F[OpenRouter AI]

C --> G[RAG Engine]

G --> H[PDF Text Extraction]

H --> I[Document Chunking]

I --> J[Context Retrieval]

J --> F

C --> K[Feedback Module]

C --> L[Admin Dashboard]

E --> M[Users]

E --> N[Conversations]

E --> O[Messages]

E --> P[Documents]

E --> Q[Document Chunks]

E --> R[Feedback]
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/santhu1711/AI-Personal-Assistant.git
```

---

## Backend

```bash
cd backend

./mvnw spring-boot:run
```

---

## Frontend

Open

```
frontend/index.html
```

or run using **VS Code Live Server**.

---

# 🌐 Deployment

## Frontend

Vercel

https://ai-personal-assistant-sable.vercel.app

---

## Backend

Railway

https://ai-personal-assistant-production-2cfc.up.railway.app

---

# 🚀 Future Enhancements

- AI Voice Conversation
- Image Upload Support
- Multi-Document RAG
- Docker Support
- Kubernetes Deployment
- AI Agents
- Mobile Application

---

# 👨‍💻 Developer

## Santhosh S

Java Backend Developer

### GitHub

https://github.com/santhu1711

### LinkedIn

https://www.linkedin.com/in/santhosh17

### Live Application

https://ai-personal-assistant-sable.vercel.app

---

# ⭐ Version

**Version 1.0**

---

<p align="center">

Built with ❤️ using Java, Spring Boot, Artificial Intelligence & Modern Web Technologies.

⭐ If you found this project useful, consider giving it a star!

</p>
