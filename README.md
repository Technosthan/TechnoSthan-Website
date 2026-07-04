# TechnoSthan Innovation Hub

A premium dark futuristic website for TechnoSthan Innovation Hub, built with React + Vite on the frontend and Node.js + Express + Prisma + PostgreSQL on the backend.

## Features

- Premium dark futuristic UI with glassmorphism and animated sections
- Multi-page React experience for Home, About, R&D Services, Skill Programs, Startup Support, Industries, Contact, and Admin Enquiries
- Enquiry form connected to PostgreSQL via Prisma
- Admin panel to view, update status, and delete enquiries

## Project Structure

- frontend/src/app/ - App shell, router, and providers
- frontend/src/shared/ - shared layouts, components, services, constants, and utilities
- frontend/src/features/ - feature-based pages and modules for home, about, services, skills, startup, industries, contact, and admin
- frontend/src/styles/ - global and theme styles
- backend/src/app.js - Express app bootstrap
- backend/src/config/ - environment, database, and CORS configuration
- backend/src/shared/ - shared middleware and utilities
- backend/src/features/enquiries/ - enquiries feature module
- backend/src/routes/ - route registration
- backend/prisma/ - Prisma schema and database setup

## Installation

### Frontend

```bash
cd frontend
npm install
```

### Backend

```bash
cd backend
npm install
cp .env.example .env
```

Update the backend .env file with your Neon PostgreSQL connection string.

## Database Setup

```bash
cd backend
npx prisma migrate dev --name init
```

If you prefer to use Prisma without migrations for local testing, you can also run:

```bash
npx prisma db push
```

## Run Locally

### Backend

```bash
cd backend
npm run dev
```

### Frontend

```bash
cd frontend
npm run dev
```

The frontend will proxy API calls to http://localhost:5000.

## Deployment Notes

- Deploy the frontend to Vercel or Netlify
- Deploy the backend to Render, Railway, Fly.io, or similar
- Set the backend environment variable DATABASE_URL to your Neon PostgreSQL connection string
- Ensure the frontend API base URL points to the deployed backend URL
