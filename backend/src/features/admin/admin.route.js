import { Router } from "express";

import projectsAdminRoutes from "../projects/projects.admin.routes.js";
import testimonialsAdminRoutes from "../testimonials/testimonials.admin.routes.js";
import heroVisualAdminRoutes from "../heroVisual/heroVisual.admin.routes.js";
import authMiddleware, {
  requireAdmin,
} from "../../core/middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware, requireAdmin);

router.use("/projects", projectsAdminRoutes);
router.use("/testimonials", testimonialsAdminRoutes);
router.use("/hero-visual", heroVisualAdminRoutes);

export default router;
