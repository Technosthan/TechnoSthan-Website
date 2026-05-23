import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import ContentPage from "./features/content/ContentPage";
import QuizPage from "./features/quiz/QuizPage";
import ChatPage from "./features/chat/ChatPage";
import DashboardPage from "./features/dashboard/DashboardPage";
import AdminRoute from "./shared/components/AdminRoute";
import ProtectedRoute from "./shared/components/ProtectedRoute";
import AdminLayout from "./features/admin/AdminLayout";
import AdminDashboardHome from "./features/admin/AdminDashboardHome";
import ContentManagement from "./features/admin/ContentManagement";
import QuizManagement from "./features/admin/QuizManagement";
import UserManagement from "./features/admin/UserManagement";
import AIControlPanel from "./features/admin/AIControlPanel";
import SettingsPanel from "./features/admin/SettingsPanel";
import AnnouncementManager from "./features/admin/AnnouncementManager";
import GlobalSearch from "./features/admin/GlobalSearch";
import MonitoringPage from "./features/admin/MonitoringPage";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { AccessControlProvider } from "./contexts/AccessControlContext.jsx";
import RouteGuard from "./shared/components/RouteGuard";
import FloatingThemeSelector from "./components/FloatingThemeSelector";
import ProfilePage from "./pages/ProfilePage.jsx";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <ThemeProvider>
      <AccessControlProvider>
        <BrowserRouter>
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
              <Route path="quiz" element={<QuizManagement />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="ai-control" element={<AIControlPanel />} />
              <Route path="settings/*" element={<SettingsPanel />} />
              <Route path="announcements" element={<AnnouncementManager />} />
              <Route path="search" element={<GlobalSearch />} />
              <Route path="monitoring" element={<MonitoringPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AccessControlProvider>
      <Toaster position="top-right" />
      <FloatingThemeSelector />
    </ThemeProvider>
  );
}

export default App;
