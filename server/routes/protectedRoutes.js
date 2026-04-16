const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

router.get("/dashboard", protect, (req, res) => {
  res.json({
    msg: "Welcome",
    user: req.user
  });
});

module.exports = router; // ⚠️ MUST