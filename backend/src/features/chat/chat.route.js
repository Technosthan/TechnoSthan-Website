import express from "express";
import {
  chat,
  getChatHistory,
  uploadFile,
  upload,
  createConversation,
  getConversationMessages,
  deleteConversation,
} from "./chat.controller.js";
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
router.post("/conversations", authMiddleware, createConversation);
router.get(
  "/conversations/:conversationId",
  authMiddleware,
  getConversationMessages,
);
router.delete(
  "/conversations/:conversationId",
  authMiddleware,
  deleteConversation,
);

export default router;
