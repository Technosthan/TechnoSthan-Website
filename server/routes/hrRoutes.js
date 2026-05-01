const express = require("express");
const router = express.Router();

const {
  getHRProfiles,
  createHRProfile,
  getHRProfileById,
  updateHRProfile,
  deleteHRProfile,
  uploadHRAvatar
} = require("../controllers/hrController");

router.get("/", getHRProfiles);
router.get("/:id", getHRProfileById);
router.post("/", createHRProfile);
router.post("/upload-avatar", uploadHRAvatar);
router.put("/:id", updateHRProfile);
router.delete("/:id", deleteHRProfile);

module.exports = router;
