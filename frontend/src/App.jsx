import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import Navbar from "./component/Navbar/Navbar";
import Footer from "./component/Footer/Footer";
import ScrollToTop from "./component/ScrollToTop";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { WorkspaceAccessProvider } from "./context/WorkspaceAccessContext";
import SessionTimeoutManager from "./component/SessionTimeoutManager";

import Homepage from "./bhoomi/pages/HomePage";
import GenericPage from "./bhoomi/pages/GenericPage";
import ProjectsPage from "./bhoomi/pages/ProjectsPage";
import ProjectDetailPage from "./bhoomi/pages/ProjectDetailPage";
import ServiceDetailPage from "./bhoomi/pages/ServiceDetailPage";
import InsightDetailPage from "./bhoomi/pages/InsightDetailPage";
import ContactPage from "./bhoomi/pages/ContactPage";
import NotFoundPage from "./bhoomi/pages/NotFoundPage";

import Login from "./component/Auth/Login";
import Register from "./component/Auth/Register";
import ForgotPassword from "./component/Auth/ForgotPassword";
import ResetPassword from "./component/Auth/ResetPassword";

import Dashboard from "./component/Dashboard/Dashboard";
import AdminDashboard from "./component/AdminDashboard/AdminDashboard";
import AdminAssignments from "./component/Assignments/AdminAssignments";
import AdminLayout from "./component/AdminLayout/AdminLayout";
import AdminUsers from "./component/AdminLayout/AdminUsers";
import ActivityLogs from "./component/AdminLayout/ActivityLogs";
import WorkspaceServices from "./component/AdminLayout/WorkspaceServices";
import AdminSettings from "./component/AdminLayout/AdminSettings";
import AdminEmailSettings from "./component/AdminLayout/AdminEmailSettings";
import DailyTasksManager from "./component/AdminLayout/DailyTasksManager";
import DataWorkManager from "./component/AdminLayout/DataWorkManager";
import DataWorkDetails from "./component/AdminLayout/DataWorkDetails";
import MenuDashboardPage from "./component/AdminLayout/MenuDashboardPage";
import MyAssignments from "./component/Assignments/MyAssignments";
import HRDashboard from "./component/HRDashboard/HRDashboard";
import UserDailyTasks from "./component/DailyTasks/UserDailyTasks";
import ProtectedRoute from "./component/Protected/ProtectedRoute";
import ProtectedAdminRoute from "./component/Protected/ProtectedAdminRoute";
import RoleRoute from "./component/Protected/RoleRoute";
import FeatureRoute from "./component/Protected/FeatureRoute";
import SocialForm from "./component/SocialForm/SocialForm";
import HRSocial from "./component/HRSocial/HRSocial";
import ExplorePage from "./Tab/ExplorePage";
import CampaignManager from "./component/AdminLayout/CampaignManager";
import PageContentManager from "./component/AdminLayout/PageContentManager";
import BusinessVerticals from "./component/AdminLayout/BusinessVerticals";
import DynamicPageSections from "./component/DynamicPageSections";
import DataDeletion from "./pages/DataDeletion";
import Solution from "./component/Solution/Solution";

const FormManagement = lazy(() => import("./component/AdminLayout/FormManagement"));
const PublicFormPage = lazy(() => import("./forms/PublicFormPage"));

function AppWrapper() {
  return (
    <Router>
      <HelmetProvider>
        <ThemeProvider>
          <SettingsProvider>
            <WorkspaceAccessProvider>
              <SessionTimeoutManager />
              <ScrollToTop />
              <App />
            </WorkspaceAccessProvider>
          </SettingsProvider>
        </ThemeProvider>
      </HelmetProvider>
    </Router>
  );
}

function App() {
  const location = useLocation();

  const hideLayout =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/register") ||
    location.pathname.startsWith("/forgot-password") ||
    location.pathname.startsWith("/reset-password") ||
    location.pathname.startsWith("/forms/") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/hr") ||
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/my-assignments");

  return (
    <>
      {!hideLayout ? <Navbar /> : null}

      <Routes>
        <Route
          path="/admin/dashboard/forms"
          element={<Navigate to="/admin/forms" replace />}
        />
        <Route
          path="/forms/:slug"
          element={
            <Suspense
              fallback={
                <div className="min-h-screen bg-[#efe8dc] p-6 text-stone-900">
                  <div className="mx-auto max-w-4xl space-y-4">
                    <div className="h-20 animate-pulse rounded-3xl bg-black/5" />
                    <div className="h-64 animate-pulse rounded-3xl bg-black/5" />
                  </div>
                </div>
              }
            >
              <PublicFormPage />
            </Suspense>
          }
        />

        <Route path="/" element={<Homepage />} />
        <Route path="/about" element={<GenericPage pageKey="about" />} />
        <Route path="/what-we-do" element={<GenericPage pageKey="whatWeDo" />} />
        <Route path="/services" element={<GenericPage pageKey="services" />} />
        <Route path="/engineering" element={<Navigate to="/what-we-do" replace />} />
        <Route path="/cloud" element={<Navigate to="/what-we-do" replace />} />
        <Route path="/digital-growth" element={<Navigate to="/what-we-do" replace />} />
        <Route path="/consulting" element={<Navigate to="/what-we-do" replace />} />
        <Route path="/services/technosthan-hospitality" element={<Navigate to="/what-we-do" replace />} />
        <Route path="/services/technosthan-innovations-hub" element={<Navigate to="/what-we-do" replace />} />
        <Route path="/services/technosthan-agritech" element={<Navigate to="/what-we-do" replace />} />
        <Route
          path="/infrastructure-development"
          element={<GenericPage pageKey="infrastructureDevelopment" />}
        />
        <Route path="/services/:slug" element={<ServiceDetailPage />} />
        <Route
          path="/real-estate-development"
          element={<GenericPage pageKey="realEstateDevelopment" />}
        />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:slug" element={<ProjectDetailPage />} />
        <Route path="/partnerships" element={<GenericPage pageKey="partnerships" />} />
        <Route
          path="/government-and-institutional-projects"
          element={<GenericPage pageKey="government" />}
        />
        <Route path="/sustainability" element={<GenericPage pageKey="sustainability" />} />
        <Route path="/investors" element={<GenericPage pageKey="investors" />} />
        <Route path="/news-and-insights" element={<GenericPage pageKey="insights" />} />
        <Route path="/insights/:slug" element={<InsightDetailPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy-policy" element={<GenericPage pageKey="privacy" />} />
        <Route path="/terms-and-conditions" element={<GenericPage pageKey="terms" />} />
        <Route path="/disclaimer" element={<GenericPage pageKey="disclaimer" />} />

        <Route path="/solution" element={<Navigate to="/contact" replace />} />
        <Route path="/data-deletion" element={<DataDeletion />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

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

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/daily-tasks" element={<Navigate to="/dashboard/daily-tasks" replace />} />
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

        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/menu-dashboards/:menuId"
          element={
            <ProtectedAdminRoute>
              <MenuDashboardPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/forms"
          element={
            <ProtectedAdminRoute>
              <AdminLayout>
                <Suspense fallback={<div className="rounded-[24px] border border-black/10 bg-white p-8 text-stone-600">Loading Form Builder...</div>}>
                  <FormManagement />
                </Suspense>
              </AdminLayout>
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
          path="/admin/page-content"
          element={
            <ProtectedAdminRoute>
              <PageContentManager />
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
          path="/admin/settings"
          element={
            <ProtectedAdminRoute>
              <AdminSettings />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/settings/email"
          element={
            <ProtectedAdminRoute>
              <AdminEmailSettings />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/data-work-manager"
          element={
            <ProtectedAdminRoute>
              <DataWorkManager />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/data-work-manager/:workId"
          element={
            <ProtectedAdminRoute>
              <DataWorkDetails />
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
        <Route path="/explore" element={<ExplorePage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {!hideLayout ? <DynamicPageSections route={location.pathname} position="footer" /> : null}
      {!hideLayout ? <Footer /> : null}
    </>
  );
}

export default AppWrapper;
