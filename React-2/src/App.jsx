import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { HelmetProvider } from "react-helmet-async";

/* LAYOUT */
import Navbar from "./component/Navbar/Navbar";
import Footer from "./component/Footer/Footer";
import SocialSidebar from "./component/SocialSidebar/SocialSidebar";
import ScrollToTop from "./component/ScrollToTop";

/* EXISTING PAGES */
import AboutPage from "./component/About/AboutPage";
import Contact from "./component/Contact/Contact";
import Solution from "./component/Solution/Solution";

import Login from "./component/Auth/Login";
import Register from "./component/Auth/Register";

import Dashboard from "./component/Dashboard/Dashboard";
import AdminDashboard from "./component/AdminDashboard/AdminDashboard";
import AdminAssignments from "./component/Assignments/AdminAssignments";
import AdminUsers from "./component/AdminLayout/AdminUsers";
import ActivityLogs from "./component/AdminLayout/ActivityLogs";
import WorkspaceServices from "./component/AdminLayout/WorkspaceServices";
import DailyTasksManager from "./component/AdminLayout/DailyTasksManager";
import MyAssignments from "./component/Assignments/MyAssignments";
import HRDashboard from "./component/HRDashboard/HRDashboard";
import UserDailyTasks from "./component/DailyTasks/UserDailyTasks";

import ProtectedRoute from "./component/Protected/ProtectedRoute";
import ProtectedAdminRoute from "./component/Protected/ProtectedAdminRoute";
import RoleRoute from "./component/Protected/RoleRoute";
import FeatureRoute from "./component/Protected/FeatureRoute";
import { WorkspaceAccessProvider } from "./context/WorkspaceAccessContext";

import SocialForm from "./component/SocialForm/SocialForm";
import HRSocial from "./component/HRSocial/HRSocial";

import ExplorePage from "./Tab/ExplorePage";

/* NEW PAGES */
import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";

import EngineeringPage from "./pages/EngineeringPage";
import CloudPage from "./pages/CloudPage";
import DigitalGrowth from "./pages/DigitalGrowth";
import ConsultingPage from "./pages/ConsultingPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CampaignPopup from "./component/CampaignPopup";
import CampaignManager from "./component/AdminLayout/CampaignManager";
import BusinessVerticals from "./component/AdminLayout/BusinessVerticals";
import TermsConditions from "./pages/TermsConditions";
import DataDeletion from "./pages/DataDeletion";

/* OLD SERVICE PAGES */
import TechnoSthanHospitality from "./component/Services/TechnoSthanHospitality";
import TechnoSthanInnovationsHub from "./component/Services/TechnoSthanInnovationsHub";
import TechnoSthanAgritech from "./component/Services/TechnoSthanAgritech";

/* WRAPPER */
function AppWrapper() {
  return (
    <Router>
      <HelmetProvider>
        <WorkspaceAccessProvider>
          <ScrollToTop />
          <App />
        </WorkspaceAccessProvider>
      </HelmetProvider>
    </Router>
  );
}

/* MAIN APP */
function App() {
  const location = useLocation();

  const noGlobalLayoutPaths = [
    "/login",
    "/register",
    "/dashboard",
    "/dashboard/daily-tasks",
    "/daily-tasks",
    "/hr",
    "/hr/daily-tasks",
    "/my-assignments",
  ];

  const hideLayout =
    noGlobalLayoutPaths.includes(location.pathname) ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/hr");

  return (
    <>
      {!hideLayout && <Navbar />}
      {!hideLayout && <SocialSidebar />}
      {!hideLayout && <CampaignPopup />}

      <Routes>
        {/* HOME */}
        <Route path="/" element={<AboutPage />} />

        {/* ABOUT */}
        <Route path="/about" element={<HomePage />} />

        {/* SERVICES MAIN */}
        <Route path="/services" element={<ServicesPage />} />

        {/* NEW SERVICE DETAIL PAGES */}
        <Route
          path="/services/technosthan-it-services"
          element={<EngineeringPage />}
        />

        <Route path="/services/technosthan-cloud" element={<CloudPage />} />

        <Route
          path="/services/technosthan-growth"
          element={<DigitalGrowth />}
        />

        <Route
          path="/services/technosthan-consulting"
          element={<ConsultingPage />}
        />

        {/* DIRECT SERVICE SLUGS */}
        <Route path="/engineering" element={<EngineeringPage />} />
        <Route path="/cloud" element={<CloudPage />} />
        <Route path="/digital-growth" element={<DigitalGrowth />} />
        <Route path="/consulting" element={<ConsultingPage />} />

        {/* OLD SERVICE PAGES */}
        <Route
          path="/services/technosthan-hospitality"
          element={<TechnoSthanHospitality />}
        />

        <Route
          path="/services/technosthan-innovations-hub"
          element={<TechnoSthanInnovationsHub />}
        />

        <Route
          path="/services/technosthan-agritech"
          element={<TechnoSthanAgritech />}
        />

        {/* OTHER */}
        <Route path="/contact" element={<Contact />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsConditions />} />
        <Route path="/data-deletion" element={<DataDeletion />} />

        <Route path="/solution" element={<Solution />} />

        {/* AUTH */}
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        {/* SOCIAL */}
        <Route
          path="/social"
          element={
            <FeatureRoute
              featureKey="socialPostingEnabled"
              blockedTitle="Social posting unavailable"
              blockedMessage="This workspace has disabled social posting or limited it to other accounts."
            >
              <SocialForm />
            </FeatureRoute>
          }
        />

        <Route path="/hr-social" element={<HRSocial />} />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/daily-tasks"
          element={<Navigate to="/dashboard/daily-tasks" replace />}
        />

        <Route
          path="/dashboard/daily-tasks"
          element={
            <FeatureRoute
              featureKey="assignmentsEnabled"
              blockedTitle="Daily tasks unavailable"
              blockedMessage="Daily tasks are disabled or not assigned to your account."
            >
              <ProtectedRoute>
                <UserDailyTasks />
              </ProtectedRoute>
            </FeatureRoute>
          }
        />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/assignments"
          element={
            <ProtectedAdminRoute>
              <AdminAssignments />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/workspace-services"
          element={
            <ProtectedAdminRoute>
              <WorkspaceServices />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/campaigns"
          element={
            <ProtectedAdminRoute>
              <CampaignManager />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/business-verticals"
          element={
            <ProtectedAdminRoute>
              <BusinessVerticals />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedAdminRoute>
              <AdminUsers />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/activity-logs"
          element={
            <ProtectedAdminRoute>
              <ActivityLogs />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/daily-tasks"
          element={
            <ProtectedAdminRoute>
              <DailyTasksManager />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/hr"
          element={
            <FeatureRoute
              featureKey="assignmentsEnabled"
              blockedTitle="Assignments unavailable"
              blockedMessage="The assignments workspace is disabled or not assigned to your account."
            >
              <RoleRoute roles={["HR", "ADMIN"]}>
                <HRDashboard />
              </RoleRoute>
            </FeatureRoute>
          }
        />

        <Route
          path="/hr/assignments"
          element={
            <FeatureRoute
              featureKey="assignmentsEnabled"
              blockedTitle="Assignments unavailable"
              blockedMessage="The assignments workspace is disabled or not assigned to your account."
            >
              <RoleRoute roles={["HR", "ADMIN"]}>
                <AdminAssignments />
              </RoleRoute>
            </FeatureRoute>
          }
        />

        <Route
          path="/hr/daily-tasks"
          element={
            <FeatureRoute
              featureKey="assignmentsEnabled"
              blockedTitle="Daily tasks unavailable"
              blockedMessage="Daily tasks are disabled or not assigned to your account."
            >
              <RoleRoute roles={["HR", "ADMIN"]}>
                <UserDailyTasks />
              </RoleRoute>
            </FeatureRoute>
          }
        />

        <Route
          path="/my-assignments"
          element={
            <FeatureRoute
              featureKey="assignmentsEnabled"
              blockedTitle="Assignments unavailable"
              blockedMessage="The assignments workspace is disabled or not assigned to your account."
            >
              <MyAssignments />
            </FeatureRoute>
          }
        />

        {/* EXPLORE */}
        <Route path="/explore" element={<ExplorePage />} />
      </Routes>

      {!hideLayout && <Footer />}
    </>
  );
}

export default AppWrapper;
