import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import ContentPage from "./features/content/ContentPage";
import QuizPage from "./features/quiz/QuizPage";
import ChatPage from "./features/chat/ChatPage";
import AdminRoute from "./shared/components/AdminRoute";
import ProtectedRoute from "./shared/components/ProtectedRoute";
import AdminDashboard from "./features/admin/AdminDashboard";
import AdminDashboardHome from "./features/admin/AdminDashboardHome";
import ContentManagement from "./features/admin/ContentManagement";
import QuizManagement from "./features/admin/QuizManagement";
import UserManagement from "./features/admin/UserManagement";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import FloatingThemeSelector from "./components/FloatingThemeSelector";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* Protected User Routes */}
          <Route
            path="/learning"
            element={
              <ProtectedRoute>
                <ContentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz"
            element={
              <ProtectedRoute>
                <QuizPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboardHome />} />
            <Route path="content" element={<ContentManagement />} />
            <Route path="quiz" element={<QuizManagement />} />
            <Route path="users" element={<UserManagement />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <FloatingThemeSelector />
    </ThemeProvider>
  );
}

export default App;
