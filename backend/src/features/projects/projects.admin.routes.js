import { Router } from "express";

import { uploadImage } from "../../core/utils/media.js";
import {
  create,
  getAdmin,
  remove,
  update,
  updateStatus,
} from "./projects.controller.js";
import { validateProjectPayload } from "./projects.validation.js";

const router = Router();

router.get("/", getAdmin);
router.post(
  "/",
  uploadImage.single("image"),
  validateProjectPayload,
  create
);
router.put(
  "/:id",
  uploadImage.single("image"),
  update
);
router.patch(
  "/:id/status",
  updateStatus
);
router.delete("/:id", remove);

export default router;
