import { Router } from "express";

import { create, getAll } from "./subscribers.controller.js";

import { validateSubscriber } from "./subscribers.validation.js";

const router = Router();

router.get("/", getAll);

router.post("/", validateSubscriber, create);

export default router;
