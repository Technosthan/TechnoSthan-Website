import express from "express";
import { chat, getChatHistory, uploadFile, upload } from "./chat.controller.js";
import authMiddleware from "../../shared/middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, chat);
router.post("/upload", authMiddleware, upload.single("file"), uploadFile);
router.get("/history", authMiddleware, getChatHistory);

export default router;
