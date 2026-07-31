import { Router } from "express";

import {
  me,
  login,
  register,
  updateProfile,
} from "./auth.controller.js";
import {
  validateProfileUpdate,
  validateLogin,
  validateRegister,
} from "./auth.validation.js";
import authMiddleware from "../../core/middlewares/auth.middleware.js";
import { uploadImage } from "../../core/utils/media.js";

const router = Router();

router.post("/login", validateLogin, login);
router.post("/register", validateRegister, register);
router.get("/me", authMiddleware, me);
router.patch(
  "/profile",
  authMiddleware,
  uploadImage.single("profileImage"),
  validateProfileUpdate,
  updateProfile
);

export default router;
