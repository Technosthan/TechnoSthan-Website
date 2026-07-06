import express from "express";
import {
  loginController,
  logoutController,
  meController,
  registerController,
} from "./auth.controller.js";
import validate from "../../shared/middleware/validate.middleware.js";
import { loginSchema, registerSchema } from "./auth.validation.js";

const router = express.Router();

router.post("/register", validate(registerSchema), registerController);
router.post("/login", validate(loginSchema), loginController);
router.get("/me", meController);
router.post("/logout", logoutController);

export default router;
