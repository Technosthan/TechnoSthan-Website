# Email Campaign Manager

A full-stack MERN application for uploading user lists and sending bulk emails with delivery tracking.

## Project Structure

```
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   ├── models/User.js
│   ├── routes/
│   ├── services/emailService.js
│   ├── utils/
│   ├── server.js
│   └── .env.example
├── frontend/
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       └── services/
└── sample-data.csv
```

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

## Environment Variables (backend/.env)

```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/emailcampaign
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

> For Gmail, use an **App Password** (not your regular password).
> Go to: Google Account → Security → 2-Step Verification → App Passwords

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/upload | Upload CSV/Excel file |
| POST | /api/send-emails | Send to all pending users |
| POST | /api/retry-failed | Retry failed emails |
| GET | /api/status | Get all users + stats |
| DELETE | /api/clear | Clear all records |

## CSV/Excel Format

Your file must have these columns (case-insensitive):

```
email, phone
user@example.com, +1-555-0101
```

## Features

- CSV and Excel file upload with validation
- Duplicate email prevention (upsert)
- Batch email sending (10/batch, 2s delay) to avoid spam limits
- Real-time status polling
- Retry failed emails
- Color-coded status: Green=Sent, Yellow=Pending, Red=Failed
- Rate limiting on API
