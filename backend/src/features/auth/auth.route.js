import express from "express";
import { register, login, googleLogin } from "./auth.controller.js";
import { getMe } from "./auth.controller.js";
import authMiddleware from "../../shared/middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.get("/me", authMiddleware, getMe);

export default router;
