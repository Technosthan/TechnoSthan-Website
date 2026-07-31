import { Router } from "express";

import {
  create,
  getAdmin,
  remove,
  reorder,
  resetGroup,
  update,
  updateStatus,
} from "./navbarOrbit.controller.js";
import {
  validateOrbitItemPayload,
  validateOrbitItemStatus,
  validateOrbitReorderPayload,
  validateOrbitResetPayload,
} from "./navbarOrbit.validation.js";

const router = Router();

router.get("/", getAdmin);
router.post("/", validateOrbitItemPayload, create);
router.put("/:id", validateOrbitItemPayload, update);
router.patch("/:id/status", validateOrbitItemStatus, updateStatus);
router.patch("/reorder", validateOrbitReorderPayload, reorder);
router.post("/reset", validateOrbitResetPayload, resetGroup);
router.delete("/:id", remove);

export default router;

