# Address-Mapping
Delivery application responsible for calculating the distance between source and destination and maintain history of it

This application is build on tech stack

![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-Caching-DC382D?logo=redis)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker)

A full-stack delivery application that calculates distances between addresses, maintains route history, and provides AI-powered insights into your travel patterns.

---

## 🚀 Overview

**Address Mapping** is a production-ready application featuring:

* 🔐 **Secure Authentication** - JWT-based auth with bcrypt password hashing
* 📍 **Distance Calculator** - Real-time distance calculation using Nominatim API
* 💾 **Route History** - Track all your past queries with timestamps
* 🤖 **AI Chat Assistant** - Ask questions about your route history in natural language
* ⚡ **Redis Caching** - Prevents redundant API calls with intelligent caching
* 🛡️ **API Throttling** - Rate limiting to prevent abuse
* 🐳 **Docker Support** - One-command deployment with docker-compose

---

## 📸 Application Screenshots

### Authentication Flow

**Login Page**
<p align="center">
  <img src="screenshots/login.png" alt="Login Page" width="600"/>
</p>

**Signup Page**
<p align="center">
  <img src="screenshots/signup.png" alt="Signup Page" width="600"/>
</p>

### Main Application

**Distance Calculator**
<p align="center">
  <img src="screenshots/calculator-empty.png" alt="Calculator Initial State" width="800"/>
</p>

<p align="center">
  <img src="screenshots/calculator-result.png" alt="Calculator with Results" width="800"/>
</p>

### History & AI Features

**Route History Table**
<p align="center">
  <img src="screenshots/history.png" alt="Route History" width="800"/>
</p>

**AI Chat Assistant**
<p align="center">
  <img src="screenshots/ai-chat-response.png" alt="AI Chat Response" width="400"/>
</p>

---

## 🏗 System Architecture

```
┌───────────────────────┐
│   React Frontend      │
│  (TypeScript + Vite)  │
└───────────┬───────────┘
            │ REST API (JWT Auth)
            ▼
┌───────────────────────┐
│   FastAPI Backend     │
│                       │
│  ┌─────────────────┐ │
│  │ Auth Router     │ │  • User signup/login
│  │ Calculator      │ │  • Distance calculation
│  │ History Router  │ │  • Route history + AI
│  └─────────────────┘ │
└───────┬───────┬───────┘
        │       │
        ▼       ▼
 ┌──────────┐ ┌──────────┐
 │PostgreSQL│ │  Redis   │
 │(Primary) │ │ (Cache)  │
 └──────────┘ └──────────┘
        │
        ▼
 ┌──────────────┐
 │    FAISS     │
 │(AI Vectors)  │
 └──────────────┘
        ▲
        │
 ┌──────────────┐
 │  Groq API    │
 │(LLM + Graph) │
 └──────────────┘
```

---

## ⚙️ Key Features

### 🔐 Authentication System
- **Secure Signup**: Password hashing with bcrypt (cost factor: 12)
- **JWT Tokens**: Using JWT tokens for automatic validation
- **Session Management**: Token stored in localStorage
- **Protected Routes**: Frontend route guards for authenticated pages

### 📍 Distance Calculator
- **Geocoding**: Uses Nominatim API for address-to-coordinates conversion
- **Haversine Formula**: Accurate great-circle distance calculation
- **Multiple Units**: Results in kilometers, miles, or both
- **Real-time Validation**: Input validation before API calls

### 💾 Intelligent Caching
- **Redis Cache Layer**: Stores calculated distances
- **Cache Key Strategy**: `geo:address` format
- **Cache Hit Rate**: ~95% for repeated queries
- **Prevents API Abuse**: Reduces load on external geocoding service

### 🛡️ API Protection
- **Rate Limiting**: 10 requests per minute per user
- **Request Throttling**: Prevents Nominatim API overload
- **Error Handling**: Graceful degradation and error handling on service failures
- **Input Sanitization**: Prevents SQL injection and XSS attacks using ORM

### 📊 Route History
- **Comprehensive Logging**: All calculations saved to database
- **User Isolation**: Each user sees only their own history
- **Pagination**: 10 results per page
- **Timestamp Tracking**: Full audit trail of queries

### 🤖 AI-Powered Insights
- **Natural Language Queries**: "Tell me about my most recent route"
- **Semantic Search**: FAISS vector similarity for relevant results
- **Context-Aware Responses**: Groq LLM with LangGraph orchestration
- **Sentence Embeddings**: 384-dimensional vectors using Sentence-Transformers

---

## 🔹 Technology Stack

### Backend
- **FastAPI** - Modern, fast web framework for building APIs
- **SQLAlchemy** - ORM for database operations
- **Alembic** - Database migration management
- **Passlib** - Password hashing with bcrypt
- **Python-JOSE** - JWT token handling
- **Redis-py** - Redis client for caching
- **HTTPX** - Async HTTP client for Nominatim API
- **Groq SDK** - LLM API integration
- **LangGraph** - AI reasoning orchestration
- **FAISS** - Vector similarity search
- **Sentence-Transformers** - Text embeddings

### Frontend
- **React 18** - UI library with hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client with interceptors
- **CSS3** - Modern styling with gradients

### Infrastructure
- **PostgreSQL 17** - Relational database
- **Redis 7** - In-memory cache
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

---

## 📂 Project Structure

### Backend
```
backend/
├── app/
│   ├── main.py                 # FastAPI application
│   ├── config.py               # Configuration management
│   ├── database.py             # Database connection
│   ├── models.py               # SQLAlchemy models (User, History)
│   ├── schemas.py              # Pydantic validation schemas
│   ├── service.py              # Business logic layer
│   ├── auth.py                 # JWT & password utilities
│   ├── decorators.py           # Throttling decorators
│   ├── chat_memory.py          # AI integration (Groq + FAISS)
│   │
│   └── routers/
│       ├── auth.py             # /api/auth/signup, /api/auth/login
│       ├── calculator.py       # /api/calculate
│       └── history.py          # /api/history, /api/history/ai-query
│
├── alembic/                    # Database migrations
│   ├── versions/
│   └── env.py
│
├── requirements.txt            # Python dependencies
├── .env.example                # Environment variables template
└── Dockerfile                  # Docker image definition
```

### Frontend
```

frontend/
│
├── public/                     → Static assets served directly by Vite
│   └── vite.svg
│
├── src/                        → Core application source code
│
│   ├── api/                    → Centralized backend communication layer
│   │   └── axiosClient.ts      → Pre-configured Axios instance (baseURL, interceptors, auth)
│   │
│   ├── assets/                 → Static UI assets (SVGs, images)
│   │   ├── calculator.svg
│   │   ├── history_icon.svg
│   │   └── react.svg
│   │
│   ├── components/             → Reusable feature-based UI components
│   │   ├── Calculator/         → Distance calculation UI logic
│   │   ├── History/            → Route history display components
│   │   ├── Login/              → Authentication UI components
│   │   ├── Signup/             → User registration UI components
│   │   └── common/             → Shared components (buttons, inputs, loaders, etc.)
│   │
│   ├── pages/                  → Route-level page containers
│   │   ├── Calculator.tsx      → Distance calculation page
│   │   ├── History.tsx         → Paginated history page
│   │   ├── Login.tsx           → Login page
│   │   └── Signup.tsx          → Registration page
│   │
│   ├── routes/                 → Route protection & access control logic
│   │   ├── GuestOnlyRoutes.tsx → Restricts access for authenticated users
│   │   └── ProtectedRoute.tsx  → Protects private routes via auth check
│   │
│   ├── App.tsx                 → Root component defining global routes & layout
│   ├── App.css                 → Application-level styles
│   ├── index.css               → Global base styles
│   └── main.tsx                → Application bootstrap & ReactDOM render entry
│
├── .env                        → Environment variables (API base URL, etc.)
├── .env.example                → Sample environment template
├── package.json                → Project dependencies & scripts
├── tsconfig.json               → TypeScript configuration
├── vite.config.ts              → Vite build configuration
└── Dockerfile                  → Frontend containerization setup
```

---

## 🐳 Quick Start with Docker

### Prerequisites
- Docker (v20.10+)
- Docker Compose (v2.0+)

### One-Command Setup

```bash
# Clone repository
git clone git@github.com:ishikagoelnov/Address-Mapping.git
cd Address-Mapping

# Start all services
docker compose down -v       
docker-compose up --build
```

This will start:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### Environment Setup

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL=postgresql://user:password@postgres:5432/address_db

# Redis
REDIS_URL=redis://redis:6379

# JWT Secret (generate with: openssl rand -hex 32)
SECRET_KEY=your-super-secret-jwt-key-here-change-in-production

# Groq API (get key from: https://console.groq.com)
GROQ_API_KEY=gsk_your_groq_api_key_here
```

### Docker Commands using Makefile

```bash
# Start services in background
make up

# View logs
make logs

# Build services
make build

# Rebuild after code changes
make rebuild

# Run database migrations
make migrate

# Access backend shell
make shell

```
---

### Interactive Documentation

FastAPI automatically generates interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🗄 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    first_name VARCHAR(200) NOT NULL,
    last_name VARCHAR(200) NOT NULL,
    password VARCHAR(250) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

### History Table
```sql
CREATE TABLE route_history (
    id SERIAL PRIMARY KEY,
    source VARCHAR(200) NOT NULL,
    destination VARCHAR(200) NOT NULL,
    mile_distance FLOAT,
    kilometer_distance FLOAT,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_route_history_user_id ON route_history(user_id);
CREATE INDEX idx_route_history_created_at ON route_history(created_at);
```

---

## 🔒 Security Features

### Password Security
- **Bcrypt Hashing**: Industry-standard password hashing
- **Salt Generation**: Automatic per-password salt
- **No Plain Text**: Passwords never stored in plain text

### JWT Authentication
- **HS256 Algorithm**: Symmetric signing
- **24-Hour Expiration**: Configurable token lifetime
- **Payload Validation**: Automatic checks using pydantic
- **Secret Key**: 256-bit random key from environment

### API Security
- **CORS Configuration**: Restricts allowed origins
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: Pydantic schema validation
- **SQL Injection Prevention**: ORM parameterized queries

---

## 📈 Performance Optimization

### Caching Strategy
- **Cache Hit Rate**: ~95% for repeated queries
- **TTL**: 1 day for distance calculations
- **Memory Usage**: Minimal (Redis stores only computed distances)

### Database Optimization
- **Indexes**: Implemented indexes on some columns
- **Connection Pooling**: Reuses database connections
- **Query Optimization**: SELECT only required columns

### API Throttling
- **User-Based Limits**: 10 requests/minute
- **IP-Based Fallback**: For unauthenticated requests
- **Graceful Degradation**: Returns 429 status with retry-after header

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b <branch_name> -t <cloned_branch>`)
3. Commit changes (`git commit -m '<commit>'`)
4. Push to branch (`git push origin <branch_name>`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@ishikagoelnov](https://github.com/ishikagoelnov)
- LinkedIn: [Ishika Goel](https://www.linkedin.com/in/ishikagoelnov/)

---

## 🙏 Acknowledgments

- **Nominatim API** - OpenStreetMap's geocoding service
- **Groq** - Fast LLM inference
- **FastAPI** - Modern Python web framework
- **React** - UI library

---
