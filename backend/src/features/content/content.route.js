import express from "express";
import {
  create,
  getAll,
  getOne,
  update,
  remove,
  summarize,
} from "./content.controller.js";

import authMiddleware from "../../shared/middleware/authMiddleware.js";
import adminOnly from "../../shared/middleware/adminOnly.js";

const router = express.Router();

// public
router.get("/", getAll);
router.get("/:id", getOne);
router.post("/summarize", authMiddleware, summarize);

// admin only
router.post("/", authMiddleware, adminOnly, create);
router.put("/:id", authMiddleware, adminOnly, update);
router.delete("/:id", authMiddleware, adminOnly, remove);

export default router;
