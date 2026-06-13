import { Router } from "express";

import { create } from "./contact.controller.js";
import { validateContact } from "./contact.validation.js";

const router = Router();

router.post(
  "/",
  validateContact,
  create
);

export default router;