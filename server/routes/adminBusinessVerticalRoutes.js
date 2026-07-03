const express = require("express");
const router = express.Router();
const multer = require("multer");
const { protect, admin } = require("../middleware/authMiddleware");
const {
  getAdminBusinessVerticals,
  createBusinessVertical,
  updateBusinessVertical,
  toggleBusinessVerticalActive,
  deleteBusinessVertical,
} = require("../controllers/businessVerticalController");

const upload = multer({ storage: multer.memoryStorage() });

router.use(protect, admin);

router.get("/", getAdminBusinessVerticals);
router.post("/", upload.single("image"), createBusinessVertical);
router.put("/:id", upload.single("image"), updateBusinessVertical);
router.patch("/:id/toggle-active", toggleBusinessVerticalActive);
router.delete("/:id", deleteBusinessVertical);

module.exports = router;
