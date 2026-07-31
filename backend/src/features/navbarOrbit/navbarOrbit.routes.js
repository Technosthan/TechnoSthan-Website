import { Router } from "express";

import { getPublic } from "./navbarOrbit.controller.js";

const router = Router();

router.get("/", getPublic);

export default router;

