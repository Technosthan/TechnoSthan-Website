import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Home from "../features/home/pages/Home";
import About from "../features/about/pages/About";
import RDServices from "../features/rd-services/pages/RDServices";
import ProgramsLandingPage from "../features/programs/pages/ProgramsLandingPage";
import SpecialisationProgramsPage from "../features/programs/pages/SpecialisationProgramsPage";
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
import MyEnrollments from "../features/student/pages/MyEnrollments";
import MyWorkshops from "../features/student/pages/MyWorkshops";
import AssignmentsProjects from "../features/student/pages/AssignmentsProjects";
import StudentPayments from "../features/student/pages/Payments";
import Profile from "../features/student/pages/Profile";
import Certificates from "../features/student/pages/Certificates";
import Support from "../features/student/pages/Support";
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
      { path: ROUTES.PROGRAMS, element: <ProgramsLandingPage /> },
      { path: ROUTES.SKILL_PROGRAMS, element: <ProgramsLandingPage /> },
      { path: ROUTES.PROGRAMS_SPECIALISATION, element: <SpecialisationProgramsPage /> },
      { path: ROUTES.WORKSHOPS, element: <Workshops /> },
      { path: "/programs/:specialisationSlug/:programSlug", element: <ProgramDetails /> },
      { path: ROUTES.STARTUP_SUPPORT, element: <StartupSupport /> },
      { path: ROUTES.INDUSTRIES, element: <Industries /> },
      { path: ROUTES.CONTACT, element: <Contact /> },
      { path: ROUTES.LOGIN, element: <Login /> },
      { path: ROUTES.REGISTER, element: <Register /> },
      { path: ROUTES.FORGOT_PASSWORD, element: <ForgotPassword /> },
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
          { path: "my-workshops", element: <MyWorkshops /> },
          { path: "my-enrollments", element: <MyEnrollments /> },
          { path: "payments", element: <StudentPayments /> },
          { path: "assignments", element: <AssignmentsProjects /> },
          { path: "profile", element: <Profile /> },
          { path: "certificates", element: <Certificates /> },
          { path: "support", element: <Support /> },
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
