import express from "express";
import cors from "cors";
import passport from "passport";
import session from "express-session";

// ✅ routes import
import authRoutes from "./features/auth/auth.route.js";
import contentRoutes from "./features/content/content.route.js";
import quizRoutes from "./features/quiz/quiz.route.js";
import chatRoutes from "./features/chat/chat.route.js";
import iotRoutes from "./features/iot/iot.route.js";
import adminRoutes from "./features/admin/admin.route.js";

const app = express();

// ✅ middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
  }),
);

app.use(express.json());

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
app.use("/api/iot", iotRoutes);
app.use("/api/admin", adminRoutes);
export default app;
