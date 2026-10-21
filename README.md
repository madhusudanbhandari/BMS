# BMS — Business Management System

**BMS (Business Management System)** is a full-stack, multi-tenant business management platform built using ASP.NET Core Web API, C#, Entity Framework Core, PostgreSQL, React, and JavaScript.

The application enables organizations to manage employees, teams, projects, tasks, and salary requests through role-based dashboards. It is designed with a focus on maintainable architecture, secure access control, and organization-level data isolation.

## Tech Stack

### Backend
- **C# / .NET 10** — Backend development
- **ASP.NET Core Web API** — RESTful API endpoints
- **Entity Framework Core** — ORM and database operations
- **PostgreSQL / Npgsql** — Relational database and provider
- **JWT** — Token-based authentication
- **BCrypt** — Password hashing
- **Swagger / OpenAPI** — API documentation and testing

### Frontend
- **React** — Component-based user interface
- **JavaScript (ES6+)** — Frontend logic
- **Vite** — Development server and build tool
- **React Router** — Client-side navigation
- **Axios** — API communication
- **Tailwind CSS** — Responsive UI styling
- **Lucide React** — Icons

### Development Tools
- Visual Studio Code
- Git and GitHub
- .NET CLI and npm
- PostgreSQL and pgAdmin

## Architecture

The backend follows a layered architecture inspired by Clean Architecture principles, separating business logic, API handling, and infrastructure concerns.

```text
BMS
├── Backend
│   ├── BMS.Api
│   │   ├── Controllers
│   │   ├── Middleware
│   │   └── Program.cs
│   ├── BMS.Application
│   │   ├── DTOs
│   │   ├── Services
│   │   └── Interfaces
│   ├── BMS.Domain
│   │   ├── Entities
│   │   └── Enums
│   ├── BMS.Infrastructure
│   │   ├── Data
│   │   ├── Repositories
│   │   └── Migrations
│   └── BMS.Tests
└── Frontend
    └── src
        ├── api
        ├── components
        ├── Pages
        └── App.jsx
```

### Request Flow

```text
React UI → Axios → API Controller
                     ↓
               Application Service
                     ↓
                  Repository
                     ↓
             Entity Framework Core
                     ↓
                PostgreSQL
```

### Key Architectural Concepts

- **Layered Architecture:** Separates API, application, domain, and infrastructure responsibilities.
- **Repository Pattern:** Centralizes database access.
- **Service Layer:** Handles business rules and coordinates operations.
- **Dependency Injection:** Supplies services and repositories through the built-in .NET container.
- **DTOs:** Controls the data accepted and returned by API endpoints.
- **Entity Framework Core:** Maps C# entities to relational database tables and manages migrations.

## Features and Functionalities

### 1. Authentication and User Management
- User login and registration
- JWT-based authentication for protected endpoints
- BCrypt password hashing
- Employee approval and rejection workflows
- User role assignment and profile management
- Role-based API authorization

### 2. Organization Management
- Register new organizations
- Create an initial organization administrator
- Allow users to request membership in an existing organization
- Manage organization employees and related resources
- Enforce organization-level access checks

The multi-tenant design allows multiple organizations to use the same application while keeping their business data logically separated.

### 3. Team Management
- Create and view teams
- Add and remove team members
- Delete teams
- View teams associated with an employee
- Associate teams with projects

The user-to-team relationship supports many-to-many membership through a join entity.

### 4. Project Management
- Create, view, update, and delete projects
- List projects belonging to an organization
- Assign teams to projects
- Track project status
- Associate tasks with projects

Project statuses include Pending, Assigned, In Progress, and Completed.

### 5. Task Management
- Create and manage tasks
- Assign tasks to employees
- Set priorities and due dates
- Update task details and status
- Retrieve tasks by project
- View assigned employee tasks
- Validate project, employee, and organization relationships

### 6. Salary Management
- Submit salary-related requests
- View personal salary records or requests
- Allow HR to review requests
- Update request status
- Record rejection reasons where applicable
- Support pagination and status filtering on salary lists

### 7. Role-Based Dashboards

The frontend provides separate application areas for different responsibilities.

| Dashboard | Main functionality |
|---|---|
| Platform Admin | Platform-level administration |
| Organization Admin | Manage users, teams, projects, and tasks |
| Manager | Coordinate projects, teams, employees, and tasks |
| Employee | Access permitted projects, assigned tasks, teams, and salary information |
| HR | Review salary-related requests |

The exact pages available depend on the current frontend routes and implemented components.

### 8. Event Recording
The backend includes event-recording logic for selected actions, such as adding an employee to a team and assigning a task. This provides a foundation for a persistent notification center and future real-time updates.

## User Roles and Access Control

The application defines the following roles:

- **Platform Admin:** Platform-level management.
- **Organization Admin:** Organization-level user and resource management.
- **Manager:** Project, team, and task coordination.
- **Employee:** Access to assigned work and permitted employee features.
- **HR:** Salary request management.

Authorization is enforced through ASP.NET Core role-based policies and controller attributes. Organization and resource ownership should also be validated by backend services; hiding a page in React alone does not secure an API.

## Database Design

PostgreSQL is used as the primary relational database, with Entity Framework Core handling persistence and schema migrations.

Core domain entities include:

- `Organization`
- `User`
- `Team`
- `Project`
- `TaskItem`
- Salary-related entities
- Event or notification-related entities, where configured

Principal relationships include:

- One organization to many users
- One organization to many teams and projects
- Many users to many teams
- One project to many tasks
- Optional task assignment to a user
- Project assignment to a team

EF Core migrations track changes to the database schema as the application evolves.

## API Overview

The backend exposes REST-style endpoints grouped by feature.

| Controller | Example endpoints | Purpose |
|---|---|---|
| Auth | `/api/Auth/login-user` | Login and user management |
| Team | `/api/Team/create-team` | Team and membership operations |
| Project | `/api/Project/create-project` | Project management and team assignment |
| TaskItem | `/api/TaskItem/create-taskItem` | Task management and assignment |
| Salary | `/api/Salary/request-salary` | Salary requests and HR review |

The API uses HTTP methods such as `GET`, `POST`, `PATCH`, and `DELETE` to retrieve and modify resources. Request DTOs define the accepted data, while authentication and authorization restrict access to protected operations.

For the complete endpoint list and request schemas, use the project's Swagger documentation.

## Getting Started

### Prerequisites
- .NET 10 SDK
- Node.js and npm
- PostgreSQL
- Git

### 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd BMS
```

### 2. Configure PostgreSQL

Create a database and configure the connection string in your local configuration or .NET user secrets. Configure JWT signing settings as well. Do not commit credentials or signing keys.

### 3. Apply database migrations

```bash
dotnet ef database update \
  --project BMS.Infrastructure \
  --startup-project BMS.Api
```

Run this command from the appropriate solution directory and ensure the EF Core tools are installed.

### 4. Start the backend

```bash
dotnet run --project BMS.Api
```

Check the terminal output for the actual API URL.

### 5. Start the frontend

Open a separate terminal:

```bash
cd Frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. Ensure the Axios base URL and backend CORS configuration match your local environment.

## Security Considerations

- Hash passwords instead of storing plaintext.
- Validate JWTs on protected endpoints.
- Keep secrets outside source control.
- Enforce role permissions on the backend.
- Validate organization ownership for resource operations.
- Avoid exposing internal exception details in production.
- Use HTTPS and appropriately restricted CORS origins in production.

## Future Enhancements

Potential extensions include:

- Real-time notifications using SignalR
- Audit logging and activity history
- Docker and CI/CD pipelines
- Expanded unit and integration test coverage
- Redis caching and background job processing
- Advanced search, reporting, and analytics

These items are planned improvements unless already implemented in the current codebase.

## Learning Outcomes

This project demonstrates practical experience with:

- C# and ASP.NET Core Web API
- Layered architecture and dependency injection
- Repository and service patterns
- DTOs and REST API design
- Entity Framework Core and PostgreSQL
- JWT authentication and role-based authorization
- Multi-tenant application design
- React, Axios, and React Router
- Database relationships and migrations
- Full-stack feature development

---

**BMS** brings together backend engineering, relational data modeling, authentication, and frontend development in a practical business application designed to evolve with additional enterprise features.
