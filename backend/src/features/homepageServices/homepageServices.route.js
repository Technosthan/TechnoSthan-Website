import express from "express";
import cors from "cors";
import { getHomepageServicesPublic } from "./homepageServices.controller.js";

const router = express.Router();

router.get(
  "/public",
  cors({
    origin: true,
    credentials: false,
    methods: ["GET"],
    allowedHeaders: ["Content-Type", "Authorization", "Cache-Control", "Pragma"],
  }),
  getHomepageServicesPublic,
);

export default router;
