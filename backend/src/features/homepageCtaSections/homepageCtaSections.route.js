import express from "express";
import cors from "cors";
import { getHomepageCtaSectionsPublic } from "./homepageCtaSections.controller.js";

const router = express.Router();

router.get(
  "/",
  cors({
    origin: true,
    credentials: false,
    methods: ["GET"],
    allowedHeaders: ["Content-Type", "Authorization", "Cache-Control", "Pragma"],
  }),
  getHomepageCtaSectionsPublic,
);

export default router;

