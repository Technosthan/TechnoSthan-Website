import { Router } from "express";

import { getPublic } from "./testimonials.controller.js";

const router = Router();

router.get("/", getPublic);

export default router;
