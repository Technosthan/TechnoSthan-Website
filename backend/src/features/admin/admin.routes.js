import express from "express";
import {
  createCurriculumModuleController,
  createHeroController,
  createLessonController,
  createTestimonialController,
  deleteCurriculumModuleController,
  deleteLessonController,
  deleteTestimonialController,
  getAdminEnquiriesController,
  getAdminEnrollmentsController,
  getAdminPaymentsController,
  getAdminStudentsController,
  getDashboardStatsController,
  getAdminProgramController,
  getSettingsController,
  getTestimonialsController,
  updateCurriculumModuleController,
  updateEnquiryStatusController,
  updateHeroController,
  updateLessonController,
  updateTestimonialController,
} from "./admin.controller.js";
import { authenticate, requireRole } from "../../shared/middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticate, requireRole("ADMIN"));

router.get("/dashboard-stats", getDashboardStatsController);
router.get("/programs/:id", getAdminProgramController);
router.post("/hero", createHeroController);
router.put("/hero/:id", updateHeroController);
router.get("/enrollments", getAdminEnrollmentsController);
router.get("/payments", getAdminPaymentsController);
router.get("/students", getAdminStudentsController);
router.get("/enquiries", getAdminEnquiriesController);
router.patch("/enquiries/:id/status", updateEnquiryStatusController);
router.post("/curriculum/modules", createCurriculumModuleController);
router.put("/curriculum/modules/:id", updateCurriculumModuleController);
router.delete("/curriculum/modules/:id", deleteCurriculumModuleController);
router.post("/lessons", createLessonController);
router.put("/lessons/:id", updateLessonController);
router.delete("/lessons/:id", deleteLessonController);
router.get("/testimonials", getTestimonialsController);
router.post("/testimonials", createTestimonialController);
router.put("/testimonials/:id", updateTestimonialController);
router.delete("/testimonials/:id", deleteTestimonialController);
router.get("/settings", getSettingsController);

export default router;
