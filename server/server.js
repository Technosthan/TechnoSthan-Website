// ================= IMPORTS =================

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const http = require("http");
const jwt = require("jsonwebtoken");
const {
  ROLES,
  getRolePermissions,
  normalizeRole,
} = require("./constants/rbac");

const { Server } = require("socket.io");

const GoogleStrategy = require("passport-google-oauth20").Strategy;

const connectMongo = require("connect-mongo");

const MongoStore = connectMongo.default || connectMongo;

require("dotenv").config();

// ================= ROUTES =================

const postRoutes = require("./routes/postRoutes");

const platformRoutes = require("./routes/platformRoutes");

const iconGridRoutes = require("./routes/iconGridRoutes");

const socialRoutes = require("./routes/socialRoutes");

const hrRoutes = require("./routes/hrRoutes");

const assignmentRoutes = require("./routes/assignmentRoutes");
const userRoutes = require("./middleware/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const { loadWorkspaceSettings } = require("./middleware/workspaceSettings");

// ================= EXPRESS APP =================

const app = express();

// ================= TRUST PROXY =================

// Required for Render / Railway / Vercel

app.set("trust proxy", 1);

// ================= HTTP SERVER =================

const server = http.createServer(app);

// ================= CORS =================

const allowedOrigins = (
  process.env.CORS_ORIGIN ||
  `
http://localhost:5173,
http://localhost:3000,
https://techno-sthan-website.vercel.app,
https://www.technosthan.com,
https://technosthan.com
`
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow Postman / Mobile Apps

    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },

  credentials: true,
};

// ================= SOCKET.IO =================

const io = new Server(server, {
  cors: corsOptions,
});

const User = require("./models/User");

io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).lean();
    if (!user || user.isActive === false) {
      return next(new Error("Unauthorized socket connection"));
    }

    socket.user = {
      id: user._id.toString(),
      role: normalizeRole(user.role),
      email: user.email,
      permissions: getRolePermissions(user.role),
    };

    return next();
  } catch (error) {
    return next(new Error("Unauthorized socket connection"));
  }
});

// ================= SECURITY =================

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },

    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],

        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],

        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],

        imgSrc: ["'self'", "data:", "blob:", "https:", "http://localhost:5000"],

        scriptSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com"],

        connectSrc: [
          "'self'",

          "http://localhost:5173",

          "http://localhost:3000",

          "https://technosthan.com",

          "https://www.technosthan.com",

          "https://techno-sthan-website.vercel.app",

          "https://accounts.google.com",

          "wss:",

          "ws:",
        ],

        frameSrc: ["'self'", "https://accounts.google.com"],

        objectSrc: ["'none'"],

        upgradeInsecureRequests: [],
      },
    },
  }),
);

// ================= RATE LIMIT =================

// Global limiter

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 100,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success: false,

    message: "Too many requests. Please try again later.",
  },

  skip: (req) => req.method === "OPTIONS",
});

// ================= AUTH LIMITER =================

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 5,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success: false,

    message: "Too many login attempts. Please try again later.",
  },

  skip: (req) => req.method === "OPTIONS",
});

// ================= MIDDLEWARE =================

// CORS

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// BODY PARSER

app.use(limiter);

app.use(
  express.json({
    limit: "10mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  }),
);

app.use("/api", loadWorkspaceSettings);

// ================= STATIC FILES =================

app.use(
  "/uploads",

  express.static(
    path.join(__dirname, "uploads"),

    {
      setHeaders: (res) => {
        res.set("Cross-Origin-Resource-Policy", "cross-origin");

        res.set("Cache-Control", "public, max-age=3600");
      },
    },
  ),
);

// ================= SESSION =================

app.use(
  session({
    secret: process.env.SESSION_SECRET || "super_secret_key",

    resave: false,

    saveUninitialized: false,

    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,

      collectionName: "sessions",
    }),

    cookie: {
      secure: process.env.NODE_ENV === "production",

      httpOnly: true,

      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",

      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

// ================= PASSPORT =================

app.use(passport.initialize());

app.use(passport.session());

// ================= GOOGLE OAUTH =================

if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CLIENT_ID !== "your_google_client_id_here"
) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,

        clientSecret: process.env.GOOGLE_CLIENT_SECRET,

        callbackURL:
          process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
      },

      async (accessToken, refreshToken, profile, done) => {
        try {
          const User = require("./models/User");

          let user = await User.findOne({
            googleId: profile.id,
          });

          if (!user) {
            user = await User.findOne({
              email: profile.emails?.[0]?.value,
            });

            if (user) {
              user.googleId = profile.id;

              await user.save();
            } else {
              user = await User.create({
                name: profile.displayName,

                email: profile.emails?.[0]?.value,

                googleId: profile.id,

                role: ROLES.USER,
              });
            }
          }

          return done(null, user);
        } catch (error) {
          console.error("Google Auth Error:", error);

          return done(error, null);
        }
      },
    ),
  );
}

// ================= SERIALIZE =================

passport.serializeUser((user, done) => {
  done(null, user.id);
});

// ================= DESERIALIZE =================

passport.deserializeUser(async (id, done) => {
  try {
    const User = require("./models/User");

    const user = await User.findById(id);

    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// ================= ROUTES =================

// AUTH ROUTES

app.use(
  "/api/auth",

  authLimiter,

  require("./routes/authRoutes"),
);

// CONTACT ROUTES

app.use(
  "/api",

  require("./routes/contactRoutes"),
);

// PROTECTED ROUTES

app.use(
  "/api",

  require("./routes/protectedRoutes"),
);

// SOCIAL ROUTES

app.use(
  "/api/social",

  socialRoutes,
);

// WHATSAPP ROUTES

app.use(
  "/api/whatsapp",

  require("./routes/whatsapp"),
);

// HR ROUTES

app.use(
  "/api/hr",

  hrRoutes,
);

// ASSIGNMENT ROUTES

app.use(
  "/api/assignments",

  assignmentRoutes,
);

// USER ROUTES

app.use(
  "/api/users",

  userRoutes,
);

// WORKSPACE SETTINGS / PUBLIC ENTRYPOINTS

app.use(
  "/api/settings",

  settingsRoutes,
);

// ADMIN WORKSPACE SETTINGS

app.use(
  "/api/admin",

  adminRoutes,
);

// ICON GRID ROUTES

app.use(
  "/api/icon-grid",

  iconGridRoutes,
);

// POSTS ROUTES

app.use(
  "/api/posts",

  postRoutes,
);

// PLATFORM ROUTES

app.use(
  "/api/platform",

  platformRoutes,
);

// ================= HEALTH CHECK =================

app.get(
  "/",

  (req, res) => {
    res.status(200).json({
      success: true,

      message: "🚀 Server is running successfully",
    });
  },
);

// ================= SOCKET EVENTS =================

io.on(
  "connection",

  (socket) => {
    if (socket.user?.id) {
      socket.join(`user:${socket.user.id}`);
    }

    if (socket.user?.role === ROLES.ADMIN) {
      socket.join("admins");
    }

    if (socket.user?.role === ROLES.HR) {
      socket.join("hrs");
    }

    socket.on(
      "disconnect",

      () => {},
    );
  },
);

// ================= MAKE IO GLOBAL =================

app.set("io", io);

// ================= DATABASE =================

mongoose
  .connect(process.env.MONGO_URI)

  .then(() => {
    console.log("✅ MongoDB Connected");
  })

  .catch((err) => {
    console.error("❌ MongoDB Error:", err);

    process.exit(1);
  });

// ================= ERROR HANDLER =================

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    success: false,

    message: err.message || "Internal Server Error",
  });
});

// ================= PORT =================

const PORT = process.env.PORT || 5000;

// ================= START SERVER =================

server.listen(
  PORT,

  () => {
    console.log(`🚀 Server running on port ${PORT}`);
  },
);
