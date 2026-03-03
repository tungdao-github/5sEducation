# 5sEducation

Monorepo for a modern online learning platform.

## Stack
- Backend: .NET 8, ASP.NET Core Web API, 3-layer architecture (API, Application, Infrastructure + Domain)
- Frontend: Next.js 16, React, TypeScript, Tailwind
- Database: SQL Server (migration-first with EF Core)

## Quick start
1. Backend
   - `cd backend`
   - `dotnet restore`
   - `dotnet run --project src/5sEducation.Api --urls http://localhost:5000`
2. Frontend
   - `cd frontend`
   - `npm install`
   - `npm run dev`

## EF Core migration workflow
- Add migration:
  - `dotnet ef migrations add <MigrationName> --project src/5sEducation.Infrastructure --startup-project src/5sEducation.Api --context ApplicationDbContext --output-dir Persistence/Migrations`
- Update database:
  - `dotnet ef database update --project src/5sEducation.Infrastructure --startup-project src/5sEducation.Api --context ApplicationDbContext`

## Architecture notes
- Backend follows SOLID-oriented service/repository/controller separation.
- Database is normalized (3NF style) with FK constraints, indexes, and migration history.
- Web events are tracked and stored in SQL Server (`WebEvents`).

## Deploy online
- Quick guide: [docs/deploy-online.md](docs/deploy-online.md)
- Render blueprint: [render.yaml](render.yaml)
"# 5sEducation" 
