const express = require("express");
const multer = require("multer");
const { protect, admin } = require("../middleware/authMiddleware");
const {
  getActiveCampaign,
  getCampaigns,
  createCampaign,
  toggleCampaign,
  deleteCampaign,
} = require("../controllers/campaignController");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
});

const router = express.Router();

router.get("/active", getActiveCampaign);
router.get("/", protect, admin, getCampaigns);
router.post("/", protect, admin, upload.single("media"), createCampaign);
router.patch("/:id/toggle", protect, admin, toggleCampaign);
router.delete("/:id", protect, admin, deleteCampaign);

module.exports = router;
