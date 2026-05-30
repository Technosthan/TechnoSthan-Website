import express from "express";
import authMiddleware from "../../shared/middleware/authMiddleware.js";
import {
  getPublicForms,
  getFormBySlug,
  submitForm,
} from "./form.controller.js";

const router = express.Router();

router.get("/", authMiddleware, getPublicForms);
router.get("/slug/:slug", authMiddleware, getFormBySlug);
router.post("/:formId/submit", authMiddleware, submitForm);

export default router;
