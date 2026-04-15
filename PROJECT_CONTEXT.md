# PROJECT_CONTEXT.md

## 1. Project Overview

This project is an AgriTech platform with a backend API (Node.js/Express/MongoDB) and a frontend (React + Vite). It provides:

- User authentication (JWT-based)
- Content management (articles/resources)
- Quiz functionality (database-backed)
- AI-powered chat (Google Gemini API, agriculture-focused)
- IoT sensor data management

**Tech Stack:**

- Backend: Node.js, Express, Mongoose, JWT, Google Generative AI
- Frontend: React, Vite, React Router, Axios, TailwindCSS, Framer Motion, Lucide React
- Database: MongoDB (via Mongoose)

---

## 2. Folder Structure

```
backend/
  .env
  package.json
  src/
    app.js
    server.js
    config/
    features/
      auth/
        auth.controller.js
        auth.route.js
        auth.service.js
        user.model.js
      chat/
        chat.controller.js
        chat.route.js
        gemini.service.js
      content/
        content.controller.js
        content.model.js
        content.route.js
        content.service.js
      iot/
        iot.controller.js
        iot.model.js
        iot.route.js
        iot.service.js
        iotData.model.js
      quiz/
        question.model.js
        quiz.controller.js
        quiz.route.js
        quiz.service.js
        quizResult.model.js
    shared/
      middleware/
        adminOnly.js
        authMiddleware.js
      utils/   (empty)
frontend/
  package.json
  index.html
  src/
    App.jsx
    App.css
    main.jsx
    index.css
    components/          # Reusable UI components
      Footer.jsx         # Enhanced footer with links and contact info
      Navbar.jsx         # Navigation bar with links and dark mode toggle
    pages/               # Route-based page components
      About.jsx          # About page
      Contact.jsx        # Contact page
      Home.jsx           # Home/landing page (refactored)
      LoginPage.jsx      # Login page
      RegisterPage.jsx   # Register page
    sections/            # Landing page sections
      AboutSection.jsx   # About section
      ContactSection.jsx # Contact/CTA section
      FeaturesSection.jsx# Features section
      HeroSection.jsx    # Hero section
    features/            # Feature-based modules
      auth/              # Authentication feature
        authApi.js       # Auth API functions
        useAuth.js       # Auth hook
      dashboard/         # Dashboard feature
        DashboardPage.jsx# Dashboard page
    shared/              # Shared utilities
      lib/
        axiosInstance.js # Axios configuration
      DarkToggle.jsx     # Dark mode toggle component
    assets/              # Static assets
  public/                # Public static assets
    hero.png             # Logo/hero image
    farmer1.png          # Farmer images
    farmer2.png
    farmer3.png
    farm-tech.png        # Tech illustration
  ...config files
```

---

## 3. Database Schema

### User

- `name`: String, required
- `email`: String, required, unique
- `password`: String, required
- `role`: String, enum [student, admin], default: student
- `timestamps`: true

### Question

- `question`: String, required
- `options`: Array of Strings, required
- `correctAnswer`: String, required
- `timestamps`: true

### QuizResult

- `userId`: ObjectId (User), required
- `quizId`: String, required
- `score`: Number, required
- `total`: Number, required
- `answers`: Array of { questionId: String, selected: String, correct: String }
- `timestamps`: true

### Content

- `title`: String, required
- `description`: String, required
- `subtopics`: Array of { heading: String, body: String }
- `resources`: Array of { label: String, url: String }
- `authorId`: ObjectId (User)
- `timestamps`: true

### IoTData

- `device_id`: String, required, index
- `soil_moisture`: Number, required
- `temperature`: Number, required
- `humidity`: Number, required
- `ph`: Number
- `timestamp`: Date, required, index
- `timestamps`: true

---

## 4. API Endpoints

### Auth

- `POST /api/auth/register` — Register user
- `POST /api/auth/login` — Login user
- `GET /api/auth/me` — Get current user (auth required)

### Content

- `GET /api/content/` — List all content
- `GET /api/content/:id` — Get content by ID
- `POST /api/content/` — Create content (auth + admin only)
- `PUT /api/content/:id` — Update content (auth + admin only)
- `DELETE /api/content/:id` — Delete content (auth + admin only)

### Quiz

- `GET /api/quiz/questions` — Get quiz questions (auth required)
- `POST /api/quiz/submit` — Submit quiz answers (auth required)
- `GET /api/quiz/results` — Get quiz results for user (auth required)

### Chat

- `POST /api/chat/` — Send message to AI (auth required)

### IoT

- `POST /api/iot/data` — Create IoT data entry (auth + admin only)
- `GET /api/iot/data` — Get all IoT data (auth + admin only)
- `GET /api/iot/latest` — Get latest IoT data entry (auth + admin only)
- `PUT /api/iot/data/:id` — Update IoT data entry (auth + admin only)
- `DELETE /api/iot/data/:id` — Delete IoT data entry (auth + admin only)

**Auth Required:** All `/me`, `/content` (except GET), `/quiz`, `/chat`, and `/iot` endpoints require JWT in `Authorization: Bearer <token>` header.

---

## 5. Auth Flow (JWT)

- On login/register, backend issues JWT signed with `JWT_SECRET`.
- JWT is required in `Authorization` header for protected routes.
- `authMiddleware.js` verifies JWT, attaches user to `req.user`.
- `adminOnly.js` checks `req.user.role === 'admin'` for admin routes.

---

## 6. Frontend Pages & Components

- `App.jsx`: Configures routes using `BrowserRouter` with routes for `/`, `/about`, `/contact`, `/login`, `/register`, `/dashboard`.
- **Pages**:
  - `Home.jsx`: Landing page composed of sections (Hero, Features, About, Contact).
  - `About.jsx`: About page with Navbar and Footer.
  - `Contact.jsx`: Contact page with Navbar and Footer.
  - `LoginPage.jsx`: Login form with validation and Footer.
  - `RegisterPage.jsx`: Registration form with validation and Footer.
  - `DashboardPage.jsx`: User dashboard with feature cards and Footer.
- **Components**:
  - `Navbar.jsx`: Sticky navigation bar with links to pages and dark mode toggle.
  - `Footer.jsx`: Comprehensive footer with brand info, links, features, contact, and legal.
- **Sections**:
  - `HeroSection.jsx`: Hero with title, description, and CTA button.
  - `FeaturesSection.jsx`: Features grid with animations.
  - `AboutSection.jsx`: Trust section and about content.
  - `ContactSection.jsx`: Call-to-action section.
- `authApi.js`: Auth API wrappers (`/auth/register`, `/auth/login`).
- `useAuth.js`: Auth hook with loading/error handling and token storage.
- `axiosInstance.js`: Shared Axios client with `VITE_API_BASE_URL` and JWT interceptor.
- `DarkToggle.jsx`: Dark mode toggle component.
- `main.jsx`: Entry point, renders `<App />`.

**UI Features**: Green/yellow gradient theme, glassmorphism, Framer Motion animations, dark mode support, responsive design.

---

## 7. Frontend ↔ Backend Integration Map

- **Auth integration is present in frontend code.**
- Frontend calls backend endpoints:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
- JWT token from login is stored in `localStorage` and attached as `Authorization: Bearer <token>` in outgoing requests.
- Remaining modules (content, quiz, chat, IoT) are not integrated in frontend yet (dashboard links exist but pages not implemented).
- All pages include Navbar and Footer for consistent navigation and branding.

---

## 8. Environment Variables

From `backend/.env`:

- `PORT` — Server port
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — JWT signing secret
- `CLIENT_URL` — Allowed CORS origin
- `GOOGLE_API_KEY` — Google Gemini API key used by chat service

Frontend environment variable expected:

- `VITE_API_BASE_URL` — Base URL for backend API used by Axios client

---

## 9. Pending / TODO

- Frontend integration pending for content, quiz, chat, and IoT modules (dashboard links exist but pages not implemented).
- `utils/` folder is empty (placeholder).
- Frontend lacks global auth state persistence/refresh and route guards.
- No admin dashboard or content management UI.
- No tests present in backend or frontend.
- README files are boilerplate or missing project-specific info.
- Privacy Policy and Terms of Service pages linked in Footer but not created.

---

## 10. Recent Updates

**April 11, 2026**

- **Added IoT Module**: Implemented backend functionality for IoT sensor data management. Includes `IoTData` model and API endpoints for creating, reading, updating, and deleting sensor data. All IoT routes are admin-only.
- **Updated Quiz Module**: Replaced the static `questions.js` file with a `Question` model, allowing quiz questions to be stored and managed in the MongoDB database.
- **Updated Documentation**: Revised `PROJECT_CONTEXT.md` to reflect the new IoT module, updated quiz structure, and associated database schemas and API endpoints.
- **Frontend Auth Integrated**: Added auth feature folder with login/register pages, API wrappers, and `useAuth` hook.
- **Routing Added in Frontend**: `App.jsx` now uses React Router with `/login` and `/register` routes.
- **Axios Client Added**: Shared Axios instance now supports `VITE_API_BASE_URL` and auto-attaches JWT token.
- **UI Dependency Added**: Installed `lucide-react` in frontend dependencies.

**April 13, 2026**

- **Frontend Refactored**: Completely restructured frontend into clean, scalable folder structure with `components/`, `pages/`, `sections/`, and `features/`.
- **Landing Page Split**: Original `LandingPage.jsx` split into `Home.jsx` (main page) and four sections: `HeroSection`, `FeaturesSection`, `AboutSection`, `ContactSection`.
- **Navigation Added**: Created `Navbar.jsx` with links to Home, About, Contact, Login, Register, and dark mode toggle.
- **Footer Enhanced**: Added comprehensive `Footer.jsx` with brand info, quick links, features, contact details, and legal links. Added to all pages.
- **UI Enhanced**: Applied modern green/yellow gradient theme, glassmorphism, Framer Motion animations, hover effects, and full dark mode support.
- **Routing Updated**: `App.jsx` now includes routes for `/`, `/about`, `/contact`, `/login`, `/register`, `/dashboard`.
- **Pages Created**: Added `About.jsx` and `Contact.jsx` pages with consistent styling and navigation.
- **Code Cleaned**: Removed duplicates and empty folders, ensuring professional code structure.

---

**Generated by GitHub Copilot — April 2026**
