import express from "express";
import {
  fetchQuestions,
  submit,
  results,
  createQuestion,
  editQuestion,
  removeQuestion,
  fetchQuestionsByContentId,
  removeQuestionsByContentId,
} from "./quiz.controller.js";

import authMiddleware from "../../shared/middleware/authMiddleware.js";
import authOptionalMiddleware from "../../shared/middleware/optionalAuthMiddleware.js";
import adminOnly from "../../shared/middleware/adminOnly.js";

const router = express.Router();

// User routes
router.get("/questions", authOptionalMiddleware, fetchQuestions);
router.post("/submit", authOptionalMiddleware, submit);
router.get("/results", authOptionalMiddleware, results);

// Admin routes for managing questions
router.post("/questions", authMiddleware, adminOnly, createQuestion);
router.put("/questions/:id", authMiddleware, adminOnly, editQuestion);
router.delete("/questions/:id", authMiddleware, adminOnly, removeQuestion);

// Content-based quiz routes
router.get(
  "/content/:contentId",
  authOptionalMiddleware,
  fetchQuestionsByContentId,
);
router.delete(
  "/content/:contentId",
  authMiddleware,
  adminOnly,
  removeQuestionsByContentId,
);

export default router;
