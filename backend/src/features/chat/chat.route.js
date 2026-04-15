import express from "express";
import { chat } from "./chat.controller.js";
import authMiddleware from "../../shared/middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, chat);

export default router;