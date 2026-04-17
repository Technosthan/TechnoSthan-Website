import express from "express";
import {
  fetchQuestions,
  submit,
  results,
  createQuestion,
  editQuestion,
  removeQuestion,
} from "./quiz.controller.js";

import authMiddleware from "../../shared/middleware/authMiddleware.js";
import adminOnly from "../../shared/middleware/adminOnly.js";

const router = express.Router();

// User routes
router.get("/questions", authMiddleware, fetchQuestions);
router.post("/submit", authMiddleware, submit);
router.get("/results", authMiddleware, results);

// Admin routes for managing questions
router.post("/questions", authMiddleware, adminOnly, createQuestion);
router.put("/questions/:id", authMiddleware, adminOnly, editQuestion);
router.delete("/questions/:id", authMiddleware, adminOnly, removeQuestion);

export default router;
