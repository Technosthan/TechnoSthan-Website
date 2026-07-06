import express from "express";
import { getHeroController } from "../programs/programs.controller.js";

const router = express.Router();

router.get("/", getHeroController);

export default router;
