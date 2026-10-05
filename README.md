# 🏢 AdminPro — Management & Administration System

A modern full-stack management system built with **React, Vite, ASP.NET Core 8, Entity Framework Core and SQLite**.

AdminPro is designed to demonstrate a real-world business management architecture with authentication, role-based access control, departments, employees, tasks, dashboards and REST APIs.

---

## 🚀 Project Overview

AdminPro provides a centralized platform for managing users, departments, employees and tasks through a clean and responsive dashboard.

The project follows a separated frontend/backend architecture:

- React frontend
- ASP.NET Core Web API backend
- Entity Framework Core
- SQLite database
- JWT authentication
- Role-based authorization
- RESTful API architecture

---

## ✨ Features

### 🔐 Authentication & Security

- JWT authentication
- Secure login
- Role-based authorization
- Admin and Employee roles
- Protected API endpoints
- Password authentication
- User profile management

### 📊 Dashboard

- Management overview
- Statistics cards
- User statistics
- Department statistics
- Employee statistics
- Task statistics
- Responsive dashboard layout

### 👥 User Management

- Create users
- Edit users
- Delete users
- View users
- Manage user roles
- User authentication

### 🏢 Department Management

- Create departments
- Edit departments
- Delete departments
- View department details
- Manage department information
- Connect employees with departments

### 👨‍💼 Employee Management

- Add employees
- Edit employee information
- Delete employees
- View employee details
- Department assignment
- Employee management

### 📋 Task Management

- Create tasks
- Assign tasks
- Edit tasks
- Delete tasks
- Task status management
- Task priority
- Employee task tracking

### 👤 Profile

- View profile
- Edit profile information
- Account management
- Secure authentication

---

## 🛠️ Tech Stack

### Frontend

- ⚛️ React
- ⚡ Vite
- 🟨 JavaScript
- 🎨 HTML5
- 🎨 CSS3
- 🔗 REST API Integration

### Backend

- 🟣 C#
- 🟣 ASP.NET Core 8
- 🗄️ Entity Framework Core
- 🔐 JWT Authentication
- 🌐 REST API
- 📚 Swagger / OpenAPI

### Database

- 🗃️ SQLite

---

## 🏗️ Architecture

```text
AdminPro
│
├── frontend
│   ├── src
│   ├── components
│   ├── pages
│   ├── services
│   └── API Integration
│
├── backend
│   └── AdminPro.Api
│       ├── Controllers
│       ├── Models
│       ├── Services
│       ├── Data
│       └── Authentication
│
└── Database
    └── SQLite