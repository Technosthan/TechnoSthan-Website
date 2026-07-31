import { Router } from "express";

import { getPublic } from "./projects.controller.js";

const router = Router();

router.get("/", getPublic);

export default router;
