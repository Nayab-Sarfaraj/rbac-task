# RBAC Project/Task Tracker

A full-stack role-based access control (RBAC) project and task management application with comprehensive audit logging capabilities.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Project Architecture](#project-architecture)
- [Testing](#testing)
- [Available Scripts](#available-scripts)

## 🎯 Overview

This application is a comprehensive project and task management system with built-in role-based access control (RBAC) and audit logging. It supports three user roles with different permission levels:

- **Admin**: Full system access, user management, audit log viewing
- **Manager**: Create and manage projects, create and assign tasks
- **Member**: View assigned tasks and projects they're a member of

All changes to the system are tracked through comprehensive audit logging.

## 🛠️ Tech Stack

### Backend

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 5.x
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with httpOnly cookies
- **Validation**: Zod schema validation
- **Security**: Helmet, bcrypt, CORS, rate limiting
- **Logging**: Pino
- **Testing**: Jest with Supertest

### Frontend

- **Framework**: Next.js 14+
- **Language**: TypeScript
- **UI Library**: shadcn/ui (Radix UI primitives)
- **Forms**: React Hook Form + Zod validation
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: React Context API

## ✨ Features

### Authentication & Authorization

- User registration and login with JWT authentication
- Role-based access control (Admin, Manager, Member)
- Automatic token refresh mechanism
- Secure password hashing with bcrypt
- HTTP-only cookie storage for refresh tokens

### User Management

- Create and manage users (Admin only)
- Role assignment and modification (Admin only)
- User deactivation with soft delete
- Comprehensive user listing with pagination and search

### Project Management

- Create and manage projects (Admin, Manager)
- Project member assignment and removal
- Role-based project visibility
- Soft delete support

### Task Management

- Create, update, and delete tasks (Admin, Manager)
- Task assignment to users
- Status tracking (todo, in_progress, done)
- Priority levels (low, medium, high)
- Due date management
- Role-based task visibility and filtering
- Full-text search on task titles

### Audit Logging

- Track all critical actions (user changes, project changes, task changes)
- Immutable audit logs with metadata
- Admin-only audit log viewing
- Comprehensive action history with timestamps

### Dashboard

- Role-specific dashboard views
- Admin: System-wide statistics and recent activity
- Manager: Team-specific metrics and overdue tasks
- Member: Personal task overview

## 📁 Project Structure

```
bruh/
├── backend/                    # Express API server
│   ├── src/
│   │   ├── app.ts             # Express app setup
│   │   ├── server.ts          # Server entry point
│   │   ├── config/            # Configuration (DB, environment)
│   │   ├── handlers/          # Request handlers (controllers)
│   │   ├── middleware/        # Express middleware
│   │   ├── models/            # Mongoose schemas
│   │   ├── repositories/      # Data access layer
│   │   ├── routes/            # API route definitions
│   │   ├── services/          # Business logic
│   │   ├── types/             # TypeScript type definitions
│   │   ├── utils/             # Utilities (errors, logger, helpers)
│   │   └── scripts/           # Database seeding scripts
│   ├── __tests__/             # Test files
│   └── package.json
│
├── frontend/                   # Next.js application
│   ├── src/
│   │   ├── app/               # App router pages
│   │   │   ├── (auth)/        # Authentication pages
│   │   │   └── (dashboard)/   # Dashboard pages
│   │   ├── components/        # React components
│   │   │   ├── layout/        # Layout components
│   │   │   └── ui/            # Reusable UI components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utilities and helpers
│   │   └── middleware.ts      # Next.js middleware
│   └── package.json
│
└── README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Git

### Installation

1. **Clone the repository**

   ```bash
   cd bruh
   ```

2. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Environment Setup

#### Backend (`backend/.env`)

```env
# Server
PORT=3001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/rbac-tracker

# JWT
JWT_ACCESS_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug
```

#### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Running the Application

1. **Start MongoDB** (if running locally)

   ```bash
   # macOS with Homebrew
   brew services start mongodb-community

   # Or docker
   docker run -d -p 27017:27017 mongo
   ```

2. **Start the backend** (from `backend/` directory)

   ```bash
   npm run dev
   ```

   Server will run at `http://localhost:3001`

3. **Start the frontend** (from `frontend/` directory)

   ```bash
   npm run dev
   ```

   Application will run at `http://localhost:3000`

4. **Seed the database** (optional, in a new terminal from `backend/`)
   ```bash
   npm run seed
   ```

### Initial Setup

After starting the application, you have two options:

**Option 1: Use Seeded Test Accounts** (Recommended for development)

Run the seed script to populate the database with test users:

```bash
npm run seed
```

This creates three test accounts with password `Password123`:

| Email                 | Role    | Password    |
| --------------------- | ------- | ----------- |
| `admin@example.com`   | Admin   | Password123 |
| `manager@example.com` | Manager | Password123 |
| `member@example.com`  | Member  | Password123 |

**Option 2: Manual Setup**

1. Register a new account at `/register`
2. First user can be manually promoted to Admin in MongoDB
3. Additional users and roles can be managed through the UI

## 📚 API Documentation

### Base URL

```
http://localhost:3001/api
```

### Response Format

All API responses follow this format:

**Success (2xx):**

```json
{
  "success": true,
  "message": "Operation completed",
  "data": {}
}
```

**Error (4xx/5xx):**

```json
{
  "success": false,
  "message": "Error description",
  "error": "Details"
}
```

### Endpoints Overview

- **Authentication** (`/api/auth`)
  - `POST /register` - Register new user
  - `POST /login` - User login
  - `POST /refresh` - Refresh access token
  - `POST /logout` - User logout
  - `GET /me` - Get current user

- **Users** (`/api/users`) - Admin only
  - `GET /` - List users
  - `GET /:id` - Get user details
  - `PATCH /:id/role` - Update user role
  - `PATCH /:id/deactivate` - Deactivate user

- **Projects** (`/api/projects`)
  - `GET /` - List projects
  - `GET /:id` - Get project details
  - `POST /` - Create project (Admin, Manager)
  - `PATCH /:id` - Update project (Admin, Manager)
  - `DELETE /:id` - Delete project (Admin, Manager)
  - `POST /:id/members` - Add project member (Admin, Manager)
  - `DELETE /:id/members/:userId` - Remove project member (Admin, Manager)

- **Tasks** (`/api/tasks`)
  - `GET /` - List tasks
  - `GET /:id` - Get task details
  - `POST /` - Create task (Admin, Manager)
  - `PATCH /:id` - Update task (Admin, Manager)
  - `PATCH /:id/status` - Update task status (Admin, Manager, Member)
  - `DELETE /:id` - Delete task (Admin, Manager)

- **Audit Logs** (`/api/audit-logs`) - Admin only
  - `GET /` - List audit logs

## 🗄️ Database Schema

### Collections

**User**

- Email (unique, indexed)
- Password hash (bcrypt)
- Role (admin, manager, member)
- Timestamps (createdAt, updatedAt)
- Soft delete flag (isDeleted)

**Project**

- Title and description
- Owner reference (User)
- Members array (User references)
- Timestamps and soft delete flag

**Task**

- Title, description, and priority
- Status (todo, in_progress, done)
- Project and assignee references
- Due date
- Timestamps and soft delete flag

**AuditLog**

- Actor (User reference)
- Action (USER_CREATED, PROJECT_UPDATED, etc.)
- Target type and ID
- Metadata (before/after values)
- Created timestamp (immutable)

## 🏗️ Project Architecture

### Backend Architecture

**Layered Structure:**

1. **Routes** - HTTP endpoint definitions
2. **Handlers** - Request entry points, parameter extraction
3. **Middleware** - Authentication, authorization, validation, error handling
4. **Services** - Business logic and validation
5. **Repositories** - Database queries and operations
6. **Models** - MongoDB schemas

**Key Patterns:**

- Service-based architecture for separation of concerns
- Repository pattern for data access abstraction
- Middleware for cross-cutting concerns
- Zod for runtime validation
- Error handling middleware for consistent error responses

### Frontend Architecture

**Component Structure:**

- **Pages** - Route-based components
- **Layouts** - Shared page layouts with sidebar and topbar
- **Components** - Reusable UI components
- **Hooks** - Custom React hooks for data fetching
- **Context** - Authentication state management
- **Utils** - Utility functions and API client

**State Management:**

- React Context API for authentication
- React Query patterns in custom hooks
- Local component state for forms

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
```

Run specific test file:

```bash
npm test -- rbac.test.ts
```

Test files are located in `backend/__tests__/`.

### Running with Test Database

Configure `MONGODB_URI` to point to a test database in test environment.

## 📝 Available Scripts

### Backend

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm run start        # Run built application
npm run seed         # Seed database with sample data
npm test             # Run test suite
npm run clean        # Remove dist directory
```

### Frontend

```bash
npm run dev          # Start Next.js development server
npm run build        # Build for production
npm run start        # Run production build
npm run lint         # Run ESLint
```

## 🔐 Security Considerations

- Passwords are hashed using bcrypt with salt rounds
- JWT tokens stored in httpOnly cookies for XSS protection
- CORS enabled for frontend domain only
- Rate limiting to prevent abuse
- Helmet.js for HTTP header security
- Input validation with Zod on all endpoints
- Soft deletes for data preservation
- Audit logging for accountability

## 📖 Additional Resources

No additional documentation files at this time.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests to ensure everything works
4. Submit a pull request

## 📄 License

ISC

## 🆘 Troubleshooting

### MongoDB Connection Issues

- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify network connectivity if using MongoDB Atlas

### CORS Errors

- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check browser console for specific CORS error messages

### Token Expiration

- Frontend automatically refreshes tokens via `/api/auth/refresh`
- If issues persist, clear cookies and re-login

### Build Errors

- Delete `node_modules` and `package-lock.json`, then run `npm install`
- Ensure Node.js version is 18 or higher
