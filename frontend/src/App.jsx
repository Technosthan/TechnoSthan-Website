import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./features/dashboard/DashboardPage";
import ContentPage from "./features/content/ContentPage";
import QuizPage from "./features/quiz/QuizPage";
import ChatPage from "./features/chat/ChatPage";
import ProtectedRoute from "./shared/components/ProtectedRoute";
import AdminRoute from "./shared/components/AdminRoute";
import AdminDashboard from "./features/admin/AdminDashboard";
import AdminDashboardHome from "./features/admin/AdminDashboardHome";
import ContentManagement from "./features/admin/ContentManagement";
import QuizManagement from "./features/admin/QuizManagement";
import UserManagement from "./features/admin/UserManagement";

function App() {
  return (
    <div className="bg-gray-200 min-h-screen">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
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
    </div>
  );
}

export default App;
