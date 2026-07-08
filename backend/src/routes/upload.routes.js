import express from "express";
import { createUploadMiddleware, uploadMediaController } from "../controllers/upload.controller.js";

const router = express.Router();
const uploader = createUploadMiddleware();

router.post("/", uploader.single("file"), uploadMediaController);
router.post("/images", uploader.single("file"), uploadMediaController);
router.post("/videos", uploader.single("file"), uploadMediaController);

export default router;
