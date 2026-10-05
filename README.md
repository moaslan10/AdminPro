# AdminPro Portfolio Full

Full management system: React + Vite frontend and ASP.NET Core 8 + SQLite + JWT backend.

## Features
- JWT login and Admin/Employee roles
- Dashboard with task statistics and overdue count
- Users CRUD with active/disabled status
- Departments CRUD with employee count
- Employees CRUD with job title and department
- Tasks CRUD with assignee, department, priority, status and due date
- Employee task visibility: employees see their assigned tasks
- Activity logs for admin actions and login
- Profile and password change
- Search and responsive UI
- Swagger and health endpoint

## Demo accounts
Admin: admin@adminpro.com / 123456
Employee: employee@adminpro.com / 123456

## Run backend
cd backend\AdminPro.Api
dotnet restore
dotnet run --urls http://localhost:5001

## Run frontend in another terminal
cd frontend
npm.cmd install
npm.cmd run dev

Open http://localhost:5173

The API uses a fresh database file named adminpro_portfolio.db to avoid conflicts with older AdminPro versions.
