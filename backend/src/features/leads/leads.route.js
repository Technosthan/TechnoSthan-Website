import { Router } from "express";
import { getAll } from "./leads.controller.js";

const router = Router();

router.get("/", getAll);

export default router;
