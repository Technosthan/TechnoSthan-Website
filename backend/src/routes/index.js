import express from "express";
import enquiryRoutes from "../features/enquiries/enquiry.routes.js";
import heroRoutes from "../features/hero/hero.routes.js";
import programRoutes from "../features/programs/programs.routes.js";
import workshopRoutes from "../features/workshops/workshops.routes.js";
import enrollmentRoutes from "../features/enrollments/enrollments.routes.js";
import paymentRoutes from "../features/payments/payments.routes.js";
import studentRoutes from "../features/student/student.routes.js";
import adminRoutes from "../features/admin/admin.routes.js";
import campaignRoutes from "../features/campaigns/campaign.routes.js";
import specialisationRoutes from "../features/specialisations/specialisations.routes.js";

const router = express.Router();

router.use("/hero", heroRoutes);
router.use("/programs", programRoutes);
router.use("/specialisations", specialisationRoutes);
router.use("/workshops", workshopRoutes);
router.use("/enrollments", enrollmentRoutes);
router.use("/payments", paymentRoutes);
router.use("/student", studentRoutes);
router.use("/admin", adminRoutes);
router.use("/enquiries", enquiryRoutes);
router.use("/campaigns", campaignRoutes);

export default router;
