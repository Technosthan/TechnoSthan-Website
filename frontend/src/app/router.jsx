import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Home from "../features/home/pages/Home";
import About from "../features/about/pages/About";
import RDServices from "../features/rd-services/pages/RDServices";
import SkillPrograms from "../features/skill-programs/pages/SkillPrograms";
import StartupSupport from "../features/startup-support/pages/StartupSupport";
import Industries from "../features/industries/pages/Industries";
import Contact from "../features/contact/pages/Contact";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import ForgotPassword from "../features/auth/pages/ForgotPassword";
import ProgramDetails from "../features/programs/pages/ProgramDetails";
import PaymentSuccess from "../features/payments/pages/PaymentSuccess";
import Workshops from "../features/workshops/pages/Workshops";
import AdminLayout from "../features/admin/layouts/AdminLayout";
import StudentLayout from "../features/student/layouts/StudentLayout";
import AdminDashboard from "../features/admin/pages/AdminDashboard";
import AdminHero from "../features/admin/pages/AdminHero";
import AdminCampaigns from "../features/admin/pages/AdminCampaigns";
import AdminPrograms from "../features/admin/pages/AdminPrograms";
import AdminProgramNew from "../features/admin/pages/AdminProgramNew";
import AdminProgramEdit from "../features/admin/pages/AdminProgramEdit";
import AdminWorkshops from "../features/admin/pages/AdminWorkshops";
import AdminEnquiries from "../features/admin/pages/AdminEnquiries";
import AdminStudents from "../features/admin/pages/AdminStudents";
import AdminPayments from "../features/admin/pages/AdminPayments";
import AdminTestimonials from "../features/admin/pages/AdminTestimonials";
import AdminSettings from "../features/admin/pages/AdminSettings";
import StudentDashboard from "../features/student/pages/StudentDashboard";
import MyPrograms from "../features/student/pages/MyPrograms";
import StudentPayments from "../features/student/pages/Payments";
import Profile from "../features/student/pages/Profile";
import Certificates from "../features/student/pages/Certificates";
import { ROUTES } from "../shared/constants/routes";
import { AdminRoute, ProtectedRoute, StudentRoute } from "../shared/components/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: ROUTES.ABOUT, element: <About /> },
      { path: ROUTES.RD_SERVICES, element: <RDServices /> },
      { path: ROUTES.SKILL_PROGRAMS, element: <SkillPrograms /> },
      { path: "/programs", element: <SkillPrograms /> },
      { path: ROUTES.WORKSHOPS, element: <Workshops /> },
      { path: ROUTES.SKILL_PROGRAMS + "/:identifier", element: <ProgramDetails /> },
      { path: ROUTES.STARTUP_SUPPORT, element: <StartupSupport /> },
      { path: ROUTES.INDUSTRIES, element: <Industries /> },
      { path: ROUTES.CONTACT, element: <Contact /> },
      { path: ROUTES.LOGIN, element: <Login /> },
      { path: ROUTES.REGISTER, element: <Register /> },
      { path: ROUTES.FORGOT_PASSWORD, element: <ForgotPassword /> },
      { path: ROUTES.PROGRAM_DETAIL_BASE + "/:identifier", element: <ProgramDetails /> },
      { path: "/payment-success", element: <PaymentSuccess /> },
      {
        path: ROUTES.DASHBOARD,
        element: (
          <ProtectedRoute>
            <StudentRoute>
              <StudentLayout />
            </StudentRoute>
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <StudentDashboard /> },
          { path: "my-programs", element: <MyPrograms /> },
          { path: "payments", element: <StudentPayments /> },
          { path: "profile", element: <Profile /> },
          { path: "certificates", element: <Certificates /> },
        ],
      },
      {
        path: ROUTES.ADMIN,
        element: (
          <ProtectedRoute>
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: "hero", element: <AdminHero /> },
          { path: "campaigns", element: <AdminCampaigns /> },
          { path: "programs", element: <AdminPrograms /> },
          { path: "programs/new", element: <AdminProgramNew /> },
          { path: "programs/:id/edit", element: <AdminProgramEdit /> },
          { path: "workshops", element: <AdminWorkshops /> },
          { path: "enquiries", element: <AdminEnquiries /> },
          { path: "students", element: <AdminStudents /> },
          { path: "payments", element: <AdminPayments /> },
          { path: "testimonials", element: <AdminTestimonials /> },
          { path: "settings", element: <AdminSettings /> },
        ],
      },
    ],
  },
]);

export default router;
