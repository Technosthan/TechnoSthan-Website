import express from "express";
import { chat, getChatHistory, uploadFile, upload } from "./chat.controller.js";
import authMiddleware from "../../shared/middleware/authMiddleware.js";
import authOptionalMiddleware from "../../shared/middleware/optionalAuthMiddleware.js";

const router = express.Router();

router.post("/", authOptionalMiddleware, chat);
router.post(
  "/upload",
  authOptionalMiddleware,
  upload.single("file"),
  uploadFile,
);
router.get("/history", authOptionalMiddleware, getChatHistory);

export default router;
