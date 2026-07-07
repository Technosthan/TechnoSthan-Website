import express from "express";
import {
  createCurriculumModuleController,
  createCampaignController,
  createHeroController,
  createLessonController,
  createTestimonialController,
  deleteCampaignController,
  deleteCurriculumModuleController,
  deleteLessonController,
  deleteTestimonialController,
  deactivateCampaignController,
  activateCampaignController,
  getAdminCampaignsController,
  getAdminEnquiriesController,
  getAdminEnrollmentsController,
  getAdminPaymentsController,
  getAdminStudentsController,
  getDashboardStatsController,
  getAdminProgramController,
  getAdminWorkshopsController,
  getSettingsController,
  getTestimonialsController,
  updateCurriculumModuleController,
  updateCampaignController,
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
router.get("/campaigns", getAdminCampaignsController);
router.post("/campaigns", createCampaignController);
router.put("/campaigns/:id", updateCampaignController);
router.patch("/campaigns/:id/activate", activateCampaignController);
router.patch("/campaigns/:id/deactivate", deactivateCampaignController);
router.delete("/campaigns/:id", deleteCampaignController);
router.post("/hero", createHeroController);
router.put("/hero/:id", updateHeroController);
router.get("/enrollments", getAdminEnrollmentsController);
router.get("/payments", getAdminPaymentsController);
router.get("/students", getAdminStudentsController);
router.get("/workshops", getAdminWorkshopsController);
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
