import { Router } from "express";

import testRoutes from "./test.routes.js";
import contactRoutes from "../features/contact/contact.route.js";
import inquiryRoutes from "../features/inquiry/inquiry.routes.js";
import servicesRoutes from "../features/services/services.routes.js";
import projectsRoutes from "../features/projects/projects.route.js";
import testimonialsRoutes from "../features/testimonials/testimonials.routes.js";
import subscribersRoutes from "../features/subscribers/subscribers.routes.js";

const router = Router();
// Test route for health check
router.use("/test", testRoutes);

router.use("/contact", contactRoutes);
router.use("/inquiry", inquiryRoutes);
router.use("/services", servicesRoutes);
router.use("/projects", projectsRoutes);
router.use("/testimonials", testimonialsRoutes);
router.use("/subscribers", subscribersRoutes);

export default router;
