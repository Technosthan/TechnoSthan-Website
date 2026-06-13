import { Router } from "express";

import {
  create,
  getAll,
} from "./projects.controller.js";

import {
  validateProject,
} from "./projects.validation.js";

const router = Router();

router.get("/", getAll);

router.post(
  "/",
  validateProject,
  create
);

export default router;