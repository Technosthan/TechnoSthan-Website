import express from "express";
import cors from "cors";
import passport from "passport";
import session from "express-session";

// ✅ routes import
import authRoutes from "./features/auth/auth.route.js";
import contentRoutes from "./features/content/content.route.js";
import quizRoutes from "./features/quiz/quiz.route.js";
import chatRoutes from "./features/chat/chat.route.js";
import adminRoutes from "./features/admin/admin.route.js";
import settingsRoutes from "./features/settings/settings.route.js";
import announcementsRoutes from "./features/announcements/announcements.route.js";

// Rate limiting
import { generalRateLimit } from "./shared/middleware/rateLimitMiddleware.js";

const app = express();

// ✅ middleware
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "https://www.technosthan.com",
  "https://techno-sthan-website-z9yp.vercel.app",
  "https://technosthan-agritech-api.onrender.com", // Allow backend itself
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error(`CORS policy does not allow access from ${origin}`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle preflight requests

app.use(express.json());

// General rate limiting
app.use(generalRateLimit);

// Passport middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: true,
  }),
);
app.use(passport.initialize());
app.use(passport.session());

// ✅ test route
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// ✅ connect routes
app.use("/api/auth", authRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/announcements", announcementsRoutes);
app.use("/api/settings", settingsRoutes);

console.log("Routes mounted");
export default app;
