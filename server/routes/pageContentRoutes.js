const express = require("express");
const { protect, admin } = require("../middleware/authMiddleware");
const {
  getPageContent,
  createPageContent,
  updatePageContent,
  deletePageContent,
  updatePageContentStatus,
} = require("../controllers/pageContentController");

const router = express.Router();

router.get("/page-content", getPageContent);
router.post("/admin/page-content", protect, admin, createPageContent);
router.put("/admin/page-content/:id", protect, admin, updatePageContent);
router.delete("/admin/page-content/:id", protect, admin, deletePageContent);
router.patch(
  "/admin/page-content/:id/status",
  protect,
  admin,
  updatePageContentStatus,
);

module.exports = router;
