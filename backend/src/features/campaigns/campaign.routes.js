import express from "express";
import { getActiveCampaignController } from "./campaign.controller.js";

const router = express.Router();

router.get("/active", getActiveCampaignController);

export default router;
