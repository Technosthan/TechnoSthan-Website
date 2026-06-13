import { Router } from "express";

import {
  create,
  getAll,
} from "./services.controller.js";

import {
  validateService,
} from "./services.validation.js";

const router = Router();

router.get("/", getAll);

router.post(
  "/",
  validateService,
  create
);

export default router;