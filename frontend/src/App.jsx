import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import VerifyPhonePage from "./pages/VerifyPhonePage";
import TelegramLoginPage from "./pages/TelegramLoginPage";
import WhatsappLoginPage from "./pages/WhatsappLoginPage";
import PublicFormPage from "./features/forms/PublicFormPage";
import ProfilePage from "./pages/ProfilePage.jsx";
import AdminRoute from "./shared/components/AdminRoute";
import ProtectedRoute from "./shared/components/ProtectedRoute";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { SettingsProvider } from "./contexts/SettingsContext.jsx";
import { AccessControlProvider } from "./contexts/AccessControlContext.jsx";
import RouteGuard from "./shared/components/RouteGuard";
import FloatingThemeSelector from "./components/FloatingThemeSelector";
import { Toaster } from "react-hot-toast";

const ContentPage = lazy(() => import("./features/content/ContentPage"));
const QuizPage = lazy(() => import("./features/quiz/QuizPage"));
const ChatPage = lazy(() => import("./features/chat/ChatPage"));
const DashboardPage = lazy(() => import("./features/dashboard/DashboardPage"));
const AdminLayout = lazy(() => import("./features/admin/AdminLayout"));
const AdminDashboardHome = lazy(() => import("./features/admin/AdminDashboardHome"));
const ContentManagement = lazy(() => import("./features/admin/ContentManagement"));
const HomepageServices = lazy(() => import("./features/admin/HomepageServices"));
const HomepageCtaSections = lazy(() => import("./features/admin/HomepageCtaSections"));
const EmpoweringCards = lazy(() => import("./features/admin/EmpoweringCards"));
const QuizManagement = lazy(() => import("./features/admin/QuizManagement"));
const UserManagement = lazy(() => import("./features/admin/UserManagement"));
const AIControlPanel = lazy(() => import("./features/admin/AIControlPanel"));
const SettingsPanel = lazy(() => import("./features/admin/SettingsPanel"));
const AnnouncementManager = lazy(() => import("./features/admin/AnnouncementManager"));
const GlobalSearch = lazy(() => import("./features/admin/GlobalSearch"));
const MonitoringPage = lazy(() => import("./features/admin/MonitoringPage"));
const AdminProfilePage = lazy(() => import("./features/admin/AdminProfilePage"));
const FormManagement = lazy(() => import("./features/admin/FormManagement"));

const RouteFallback = () => (
  <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
  </div>
);

function App() {
  return (
    <SettingsProvider>
      <ThemeProvider>
        <AccessControlProvider>
          <BrowserRouter>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route element={<RouteGuard />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/landing" element={<LandingPage />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/verify-email" element={<VerifyEmailPage />} />
                  <Route path="/verify-phone" element={<VerifyPhonePage />} />
                  <Route path="/login/telegram" element={<TelegramLoginPage />} />
                  <Route path="/login/whatsapp" element={<WhatsappLoginPage />} />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  <Route path="/AgriTech Wiki" element={<ContentPage />} />
                  <Route path="/quiz/:contentId" element={<QuizPage />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/forms/:slug" element={<PublicFormPage />} />
                  <Route path="/f/:slug" element={<PublicFormPage />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />
                </Route>

                <Route
                  path="/admin/dashboard"
                  element={
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  }
                >
                  <Route index element={<AdminDashboardHome />} />
                  <Route path="content" element={<ContentManagement />} />
                  <Route path="homepage-services" element={<HomepageServices />} />
                  <Route path="homepage-cta-sections" element={<HomepageCtaSections />} />
                  <Route path="empowering-cards" element={<EmpoweringCards />} />
                  <Route path="quiz" element={<QuizManagement />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="forms" element={<FormManagement />} />
                  <Route path="ai-control" element={<AIControlPanel />} />
                  <Route path="settings/*" element={<SettingsPanel />} />
                  <Route path="profile" element={<AdminProfilePage />} />
                  <Route path="announcements" element={<AnnouncementManager />} />
                  <Route path="search" element={<GlobalSearch />} />
                  <Route path="monitoring" element={<MonitoringPage />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AccessControlProvider>
        <Toaster position="top-right" />
        <FloatingThemeSelector />
      </ThemeProvider>
    </SettingsProvider>
  );
}

export default App;
