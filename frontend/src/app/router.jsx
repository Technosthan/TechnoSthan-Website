import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Home from "../features/home/pages/Home";
import About from "../features/about/pages/About";
import RDServices from "../features/rd-services/pages/RDServices";
import SkillPrograms from "../features/skill-programs/pages/SkillPrograms";
import StartupSupport from "../features/startup-support/pages/StartupSupport";
import Industries from "../features/industries/pages/Industries";
import Contact from "../features/contact/pages/Contact";
import AdminEnquiries from "../features/admin-enquiries/pages/AdminEnquiries";
import { ROUTES } from "../shared/constants/routes";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: ROUTES.HOME, element: <Home /> },
      { path: ROUTES.ABOUT, element: <About /> },
      { path: ROUTES.RD_SERVICES, element: <RDServices /> },
      { path: ROUTES.SKILL_PROGRAMS, element: <SkillPrograms /> },
      { path: ROUTES.STARTUP_SUPPORT, element: <StartupSupport /> },
      { path: ROUTES.INDUSTRIES, element: <Industries /> },
      { path: ROUTES.CONTACT, element: <Contact /> },
      { path: ROUTES.ADMIN, element: <AdminEnquiries /> },
    ],
  },
]);

export default router;
