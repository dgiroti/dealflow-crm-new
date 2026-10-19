# dealflow-crm-new

# DealFlow CRM

A multi-tenant CRM for small sales teams: manage companies and contacts, move deals
through a drag-and-drop pipeline, track tasks, and see team performance on a dashboard.

> 🚧 In active development. See the project plan below.

## Tech stack

- **Frontend:** React, TypeScript, Vite, TanStack Query, Tailwind CSS, shadcn/ui
- **Backend:** Node.js, Express, TypeScript, PostgreSQL, Drizzle ORM
- **Shared:** Zod schemas used by both frontend and backend
- **DevOps:** Docker, GitHub Actions, AWS Lambda, Netlify

## Project structure

| Folder            | What it contains                      |
| ----------------- | ------------------------------------- |
| `apps/api`        | Express REST API                      |
| `apps/web`        | React web app                         |
| `packages/shared` | Validation schemas and types for both |

## Getting started

Open the repository in GitHub Codespaces, then:

    npm install
    npm test

    npm run dev:api      # start the API on http://localhost:3000
    npm run dev:web      # start the web app on http://localhost:5173
