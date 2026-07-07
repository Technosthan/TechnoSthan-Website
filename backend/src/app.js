import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import { corsOptions } from "./config/cors.js";
import { env } from "./config/env.js";
import routes from "./routes/index.js";
import errorMiddleware from "./shared/middleware/error.middleware.js";
import authRoutes from "./features/auth/auth.routes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

// Serve static files from frontend dist folder
// Try multiple possible paths for flexibility
const possiblePaths = [
  path.join(__dirname, "../../frontend/dist"),
  path.join(process.cwd(), "frontend/dist"),
  path.join(process.cwd(), "../frontend/dist"),
  "/opt/render/project/frontend/dist", // Render's typical path
];

let frontendPath = possiblePaths[0]; // default fallback
for (const p of possiblePaths) {
  if (existsSync(p)) {
    frontendPath = p;
    console.log(`✓ Serving static files from: ${frontendPath}`);
    break;
  }
}

if (!existsSync(frontendPath)) {
  console.warn(`⚠ Frontend dist not found. Checked paths:`, possiblePaths);
}

// Serve static files with high priority
app.use(express.static(frontendPath, { maxAge: "1d", etag: false }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads"), { maxAge: "7d" }));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api", routes);
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// SPA fallback - serve index.html for all non-API routes
// This must come BEFORE error middleware
app.use((_req, res) => {
  const indexPath = path.join(frontendPath, "index.html");
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: "Frontend not built. Run: npm run build" });
  }
});

app.use(errorMiddleware);

export { app, env };
