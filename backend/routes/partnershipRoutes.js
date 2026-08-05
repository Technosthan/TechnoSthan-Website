const express = require("express");
const { protect, admin } = require("../middleware/authMiddleware");
const {
  getPartnerships,
  getPartnershipBySlug,
  createPartnership,
  updatePartnership,
  deletePartnership,
  updatePartnershipStatus,
} = require("../controllers/partnershipController");

const router = express.Router();

router.get("/", getPartnerships);
router.get("/:slug", getPartnershipBySlug);

router.post("/admin", protect, admin, createPartnership);
router.put("/admin/:id", protect, admin, updatePartnership);
router.delete("/admin/:id", protect, admin, deletePartnership);
router.patch("/admin/:id/status", protect, admin, updatePartnershipStatus);

module.exports = router;

