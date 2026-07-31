import { Router } from "express";

import { uploadImage } from "../../core/utils/media.js";
import {
  create,
  getAdmin,
  remove,
  update,
  updateStatus,
} from "./testimonials.controller.js";
import {
  validateTestimonialPayload,
  validateTestimonialStatus,
} from "./testimonials.validation.js";

const router = Router();

router.get("/", getAdmin);
router.post(
  "/",
  uploadImage.single("image"),
  validateTestimonialPayload,
  create
);
router.put(
  "/:id",
  uploadImage.single("image"),
  update
);
router.patch(
  "/:id/status",
  validateTestimonialStatus,
  updateStatus
);
router.delete("/:id", remove);

export default router;
