import express from "express";
import cors from "cors";
import authMiddleware from "../../shared/middleware/authMiddleware.js";
import adminOnly from "../../shared/middleware/adminOnly.js";
import {
  createCard,
  deleteCard,
  getEmpoweringCard,
  getPublicEmpoweringCardsController,
  listEmpoweringCards,
  reorderCards,
  previewUpload,
  updateCard,
  updateCardStatus,
} from "./empoweringCards.controller.js";

const router = express.Router();

router.get(
  "/public",
  cors({
    origin: true,
    credentials: false,
    methods: ["GET"],
    allowedHeaders: ["Content-Type", "Authorization", "Cache-Control", "Pragma"],
  }),
  getPublicEmpoweringCardsController,
);

router.use(authMiddleware);
router.use(adminOnly);

router.get("/", listEmpoweringCards);
router.patch("/reorder", reorderCards);
router.post("/preview-upload", previewUpload);
router.get("/:cardId", getEmpoweringCard);
router.post("/", createCard);
router.put("/:cardId", updateCard);
router.patch("/:cardId/status", updateCardStatus);
router.delete("/:cardId", deleteCard);

export default router;
