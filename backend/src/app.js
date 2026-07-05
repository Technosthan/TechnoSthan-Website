import express from "express";
import cors from "cors";
import passport from "passport";
import session from "express-session";
import path from "path";

// ✅ routes import
import authRoutes from "./features/auth/auth.route.js";
import contentRoutes from "./features/content/content.route.js";
import quizRoutes from "./features/quiz/quiz.route.js";
import chatRoutes from "./features/chat/chat.route.js";
import adminRoutes from "./features/admin/admin.route.js";
import settingsRoutes from "./features/settings/settings.route.js";
import announcementsRoutes from "./features/announcements/announcements.route.js";
import formRoutes from "./features/form/form.route.js";
import { sendEmail } from "./services/email/sendEmail.js";
import { resolveEmailProvider } from "./features/admin/otpProvider.service.js";

// Rate limiting
import { generalRateLimit } from "./shared/middleware/rateLimitMiddleware.js";
import publicAccessControl from "./shared/middleware/publicAccessControl.js";

const app = express();

// ✅ allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://www.technosthan.com",
  "https://agritech.technosthan.com",
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
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Cache-Control",
      "Pragma",
    ],
  }),
);

app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

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
app.get("/", async (req, res) => {
  const activeProvider = await resolveEmailProvider();
  res.send("API is running 🚀");
});

app.get("/api/health", async (req, res) => {
  const activeProvider = await resolveEmailProvider();
  res.json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
    emailProviderConfigured: !!activeProvider || !!process.env.RESEND_API_KEY,
    emailFrom: process.env.EMAIL_FROM || "AgriTech <noreply@agritech.com>",
  });
});

app.get("/api/health/email", async (req, res) => {
  const activeProvider = await resolveEmailProvider();
  if (!activeProvider && !process.env.RESEND_API_KEY) {
    return res.status(500).json({
      success: false,
      message:
        "No active email provider configured and RESEND_API_KEY is not set",
    });
  }

  const healthData = {
    success: true,
    message: activeProvider
      ? "Active email provider is configured"
      : "RESEND_API_KEY is configured",
    emailProviderConfigured: true,
    emailFrom: process.env.EMAIL_FROM || "AgriTech <noreply@agritech.com>",
  };

  const testEmail = req.query.email;
  if (!testEmail) {
    return res.json({
      ...healthData,
      note: "Add ?email=you@example.com to send a test health email",
    });
  }

  try {
    const result = await sendEmail({
      to: testEmail,
      from: process.env.EMAIL_FROM || "AgriTech <noreply@agritech.com>",
      subject: "AgriTech Resend health check",
      html: `<p>This is a Resend health check email from AgriTech. If you received it, the email service is working.</p>`,
    });

    return res.json({
      ...healthData,
      testEmail,
      result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Resend email health check failed",
      error: error?.message || error,
    });
  }
});

// ✅ connect routes
app.use("/api/auth", authRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/forms", formRoutes);
app.use("/api/announcements", announcementsRoutes);
app.use("/api/settings", settingsRoutes);

console.log("Routes mounted");

export default app;
