import { Router } from "express";

import { getPublic } from "./heroVisual.controller.js";

const router = Router();

router.get("/", getPublic);

export default router;
