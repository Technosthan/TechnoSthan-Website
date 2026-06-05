const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const permissionController = require("../controllers/permissionController");

// Apply auth middleware to all routes
router.use(protect);

/**
 * GLOBAL SERVICES ROUTES
 */
router.get("/global-services", permissionController.getGlobalServices);
router.put("/global-services", admin, permissionController.updateGlobalService);

/**
 * ROLE PERMISSIONS ROUTES
 */
router.get("/role-permissions", permissionController.getRolePermissions);
router.put(
  "/role-permissions",
  admin,
  permissionController.updateRolePermission,
);

/**
 * USER OVERRIDE ROUTES
 */
router.get("/user-overrides", admin, permissionController.getUserOverrides);
router.post("/user-overrides", admin, permissionController.setUserOverride);
router.delete(
  "/user-overrides",
  admin,
  permissionController.removeUserOverride,
);

/**
 * PERMISSION CHECK ROUTES
 */
router.get("/check", permissionController.checkPermission);
router.get("/user-permissions", permissionController.getUserPermissions);

module.exports = router;
