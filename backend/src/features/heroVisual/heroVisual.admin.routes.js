import { Router } from "express";

import { uploadImage } from "../../core/utils/media.js";
import {
  createFeature,
  getAdmin,
  removeFeature,
  saveSetting,
  updateFeature,
  updateFeatureStatus,
} from "./heroVisual.controller.js";
import {
  validateHeroFeaturePayload,
  validateHeroFeatureStatus,
  validateHeroSettingPayload,
} from "./heroVisual.validation.js";

const router = Router();

router.get("/", getAdmin);
router.put(
  "/",
  uploadImage.single("mainImage"),
  validateHeroSettingPayload,
  saveSetting
);
router.post(
  "/features",
  uploadImage.single("iconImage"),
  validateHeroFeaturePayload,
  createFeature
);
router.put(
  "/features/:id",
  uploadImage.single("iconImage"),
  updateFeature
);
router.patch(
  "/features/:id/status",
  validateHeroFeatureStatus,
  updateFeatureStatus
);
router.delete("/features/:id", removeFeature);

export default router;
