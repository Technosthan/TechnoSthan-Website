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
import publicAccessControl from "./shared/middleware/publicAccessControl.js";

const app = express();

// ✅ allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://www.technosthan.com",
  "https://techno-sthan-website-z9yp.vercel.app",
];

// ✅ allow all vercel preview deployments
const isVercelPreview = (origin) => {
  return origin && origin.includes(".vercel.app");
};

// ✅ CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (Postman, mobile apps, curl)
      if (!origin) {
        return callback(null, true);
      }

      // allow fixed origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // allow all vercel preview deployments
      if (isVercelPreview(origin)) {
        return callback(null, true);
      }

      console.log("Blocked by CORS:", origin);

      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

app.use(express.json());

// General rate limiting
app.use(generalRateLimit);

// Public access control for non-auth API routes
app.use(publicAccessControl);

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
