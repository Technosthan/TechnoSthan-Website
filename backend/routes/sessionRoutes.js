const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { recordSessionActivity } = require("../controllers/sessionController");

const router = express.Router();

router.post("/activity", protect, recordSessionActivity);

module.exports = router;
