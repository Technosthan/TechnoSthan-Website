import express from "express";
import { getSpecialisationsController, getSpecialisationController } from "./specialisations.controller.js";

const router = express.Router();

router.get("/", getSpecialisationsController);
router.get("/:specialisationSlug", getSpecialisationController);

export default router;
