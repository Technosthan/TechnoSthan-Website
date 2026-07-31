import { Router } from "express";

import { create } from "./inquiry.controller.js";
import { validateInquiry } from "./inquiry.validation.js";

const router = Router();

router.post(
  "/",
  validateInquiry,
  create
);

export default router;