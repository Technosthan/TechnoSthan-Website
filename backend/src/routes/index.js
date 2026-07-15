import { Router } from "express";
import authRoutes from "../features/auth/auth.route.js";
import adminRoutes from "../features/admin/admin.route.js";

import testRoutes from "./test.routes.js";
import contactRoutes from "../features/contact/contact.route.js";
import inquiryRoutes from "../features/inquiry/inquiry.routes.js";
import servicesRoutes from "../features/services/services.routes.js";
import projectsRoutes from "../features/projects/projects.routes.js";
import testimonialsRoutes from "../features/testimonials/testimonials.routes.js";
import subscribersRoutes from "../features/subscribers/subscribers.routes.js";
import heroVisualRoutes from "../features/heroVisual/heroVisual.routes.js";

const router = Router();
// Test route for health check
router.use("/test", testRoutes);

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);

router.use("/contact", contactRoutes);
router.use("/inquiry", inquiryRoutes);
router.use("/services", servicesRoutes);
router.use("/projects", projectsRoutes);
router.use("/testimonials", testimonialsRoutes);
router.use("/hero-visual", heroVisualRoutes);
router.use("/subscribers", subscribersRoutes);

export default router;
