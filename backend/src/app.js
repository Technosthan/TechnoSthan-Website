import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { corsOptions } from "./config/cors.js";
import { env } from "./config/env.js";
import routes from "./routes/index.js";
import errorMiddleware from "./shared/middleware/error.middleware.js";

dotenv.config();

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use("/api", routes);
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use(errorMiddleware);

export { app, env };
