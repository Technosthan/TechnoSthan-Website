import express from "express";
import { chat, getChatHistory } from "./chat.controller.js";
import authMiddleware from "../../shared/middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, chat);
router.get("/history", authMiddleware, getChatHistory);

export default router;
