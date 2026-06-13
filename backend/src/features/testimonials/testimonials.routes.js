import { Router } from "express";

import {
  create,
  getAll,
} from "./testimonials.controller.js";

import {
  validateTestimonial,
} from "./testimonials.validation.js";

const router = Router();

router.get("/", getAll);

router.post(
  "/",
  validateTestimonial,
  create
);

export default router;