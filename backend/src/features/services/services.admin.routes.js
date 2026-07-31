import { Router } from "express";

import {
  create,
  getAdmin,
  remove,
  update,
  updateStatus,
} from "./services.controller.js";
import { validateService } from "./services.validation.js";

const router = Router();

router.get("/", getAdmin);
router.post("/", validateService, create);
router.put("/:id", update);
router.patch("/:id/status", updateStatus);
router.delete("/:id", remove);

export default router;
