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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

// Serve static files from frontend dist folder
// Try multiple possible paths for flexibility
const possiblePaths = [
  path.join(__dirname, "../../frontend/dist"),
  path.join(process.cwd(), "frontend/dist"),
  path.join(process.cwd(), "../frontend/dist"),
];

let frontendPath = possiblePaths[0]; // default fallback
for (const p of possiblePaths) {
  if (existsSync(p)) {
    frontendPath = p;
    console.log(`Serving static files from: ${frontendPath}`);
    break;
  }
}

app.use(express.static(frontendPath));

// API routes
app.use("/api", routes);
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Fallback for SPA routing - serve index.html for all non-API routes
app.get("*", (_req, res) => {
  const indexPath = path.join(frontendPath, "index.html");
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res
      .status(404)
      .json({ error: "Frontend not built. Please run: npm run build" });
  }
});

app.use(errorMiddleware);

export { app, env };
