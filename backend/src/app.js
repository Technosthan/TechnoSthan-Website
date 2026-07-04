import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
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
const frontendPath = path.join(__dirname, "../../frontend/dist");
app.use(express.static(frontendPath));

// API routes
app.use("/api", routes);
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Fallback for SPA routing - serve index.html for all non-API routes
app.get("*", (_req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.use(errorMiddleware);

export { app, env };
