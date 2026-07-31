import { Router } from "express";

import projectsAdminRoutes from "../projects/projects.admin.routes.js";
import testimonialsAdminRoutes from "../testimonials/testimonials.admin.routes.js";
import heroVisualAdminRoutes from "../heroVisual/heroVisual.admin.routes.js";
import servicesAdminRoutes from "../services/services.admin.routes.js";
import navbarOrbitAdminRoutes from "../navbarOrbit/navbarOrbit.admin.routes.js";
import leadsRoutes from "../leads/leads.route.js";
import authMiddleware, {
  requireAdmin,
} from "../../core/middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware, requireAdmin);

router.use("/projects", projectsAdminRoutes);
router.use("/testimonials", testimonialsAdminRoutes);
router.use("/hero-visual", heroVisualAdminRoutes);
router.use("/services", servicesAdminRoutes);
router.use("/navbar-orbit-items", navbarOrbitAdminRoutes);
router.use("/leads", leadsRoutes);

export default router;
