const express = require("express");
const multer = require("multer");
const { protect, admin } = require("../middleware/authMiddleware");
const {
  createDataWork,
  deleteDataWork,
  exportDataWork,
  getAdminDataWorkById,
  getAdminDataWorkRecords,
  getAdminDataWorks,
  previewUpload,
  replaceDataWorkFile,
  updateDataWork,
} = require("../controllers/dataWorkController");
const { MAX_FILE_SIZE_BYTES } = require("../services/dataWorkImportService");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
});

const router = express.Router();

router.use(protect, admin);

const handleSingleFile = (fieldName, handler) => (req, res, next) => {
  upload.single(fieldName)(req, res, (error) => {
    if (error) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          success: false,
          message: "The selected file exceeds the 10 MB limit.",
        });
      }

      return res.status(400).json({
        success: false,
        message: error.message || "Failed to upload file",
      });
    }

    return handler(req, res, next);
  });
};

router.get("/", getAdminDataWorks);
router.post("/preview", handleSingleFile("file", previewUpload));
router.post("/", handleSingleFile("file", createDataWork));
router.get("/:workId", getAdminDataWorkById);
router.get("/:workId/records", getAdminDataWorkRecords);
router.put("/:workId", updateDataWork);
router.post("/:workId/file", handleSingleFile("file", replaceDataWorkFile));
router.delete("/:workId", deleteDataWork);
router.get("/:workId/export", exportDataWork);

module.exports = router;
