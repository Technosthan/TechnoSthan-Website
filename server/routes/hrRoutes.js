const express = require("express");
const router = express.Router();

const {
  getHRProfiles,
  createHRProfile,
  updateHRProfile,
  deleteHRProfile
} = require("../controllers/hrController");

router.get("/", getHRProfiles);
router.post("/", createHRProfile);
router.put("/:id", updateHRProfile);
router.delete("/:id", deleteHRProfile);

module.exports = router;
