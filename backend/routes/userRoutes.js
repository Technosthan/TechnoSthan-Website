const router = require("express").Router();
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  uploadContacts,
  getMyStatus,
  updateHeaders,
  deleteMyContacts,
} = require("../controllers/userController");

router.post("/upload", protect, upload.single("file"), uploadContacts);
router.get("/status", protect, getMyStatus);
router.put("/headers", protect, updateHeaders);
router.delete("/my-contacts", protect, deleteMyContacts);

module.exports = router;
