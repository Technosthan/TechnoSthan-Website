// ============================================================
// EXAMPLE: Complete App.jsx Routes with Legal Pages
// ============================================================
// Copy and adapt this example for your App.jsx

import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import Legal Pages
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

// Import Existing Pages
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
import ProfilePage from "./pages/ProfilePage.jsx";

// Import Providers & Guards
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { AccessControlProvider } from "./contexts/AccessControlContext.jsx";
import RouteGuard from "./shared/components/RouteGuard";
import FloatingThemeSelector from "./components/FloatingThemeSelector";
import ProtectedRoute from "./shared/components/ProtectedRoute";
import AdminRoute from "./shared/components/AdminRoute";
import AdminLayout from "./features/admin/AdminLayout";

// Import Admin Pages
import AdminDashboardHome from "./features/admin/AdminDashboardHome";
import ContentManagement from "./features/admin/ContentManagement";
import QuizManagement from "./features/admin/QuizManagement";
import UserManagement from "./features/admin/UserManagement";
import AIControlPanel from "./features/admin/AIControlPanel";
import SettingsPanel from "./features/admin/SettingsPanel";
import AnnouncementManager from "./features/admin/AnnouncementManager";

// Import UI
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <ThemeProvider>
      <AccessControlProvider>
        <BrowserRouter>
          <Routes>
            {/* ============================================
                PUBLIC PAGES (with RouteGuard)
                ============================================ */}
            <Route element={<RouteGuard />}>
              {/* Home & Landing */}
              <Route path="/" element={<Home />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />

              {/* Authentication Pages */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/verify-phone" element={<VerifyPhonePage />} />
              <Route path="/login/telegram" element={<TelegramLoginPage />} />
              <Route path="/login/whatsapp" element={<WhatsappLoginPage />} />

              {/* ============================================
                  LEGAL PAGES - NEW
                  ============================================ */}
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/terms" element={<TermsOfService />} />

              {/* ============================================
                  PROTECTED PAGES
                  ============================================ */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Content & Learning */}
              <Route path="/AgriTech Wiki" element={<ContentPage />} />
              <Route path="/quiz/:contentId" element={<QuizPage />} />
              <Route path="/chat" element={<ChatPage />} />

              {/* Dashboard */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* ============================================
                ADMIN PAGES (with AdminRoute)
                ============================================ */}
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
              <Route path="quizzes" element={<QuizManagement />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="ai-control" element={<AIControlPanel />} />
              <Route path="settings" element={<SettingsPanel />} />
              <Route path="announcements" element={<AnnouncementManager />} />
            </Route>

            {/* Fallback - 404 (optional) */}
            <Route path="*" element={<Home />} />
          </Routes>

          {/* Global Components */}
          <FloatingThemeSelector />
          <Toaster position="top-right" />
        </BrowserRouter>
      </AccessControlProvider>
    </ThemeProvider>
  );
}

export default App;

// ============================================================
// EXAMPLE: Footer Component with Legal Links
// ============================================================

import { Link } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";

export function Footer() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  return (
    <footer
      className={`mt-20 py-12 border-t ${
        isDark ? "bg-gray-900 border-gray-800" : "bg-gray-50 border-gray-200"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="font-bold text-lg mb-4">Technosthan AgriTech</h3>
            <p
              className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              Empowering farmers with AI-driven agricultural intelligence.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <nav className="space-y-2">
              <Link
                to="/AgriTech Wiki"
                className={`text-sm hover:text-green-500 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Learn
              </Link>
              <Link
                to="/chat"
                className={`text-sm hover:text-green-500 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                AI Assistant
              </Link>
              <Link
                to="/about"
                className={`text-sm hover:text-green-500 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                About Us
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <nav className="space-y-2">
              <Link
                to="/contact"
                className={`text-sm hover:text-green-500 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Contact Us
              </Link>
              <a
                href="mailto:support@technosthan.com"
                className={`text-sm hover:text-green-500 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Email Support
              </a>
              <Link
                to="/faq"
                className={`text-sm hover:text-green-500 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                FAQ
              </Link>
            </nav>
          </div>

          {/* Legal - NEW */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <nav className="space-y-2">
              <Link
                to="/privacy-policy"
                className={`text-sm hover:text-green-500 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms-of-service"
                className={`text-sm hover:text-green-500 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Terms of Service
              </Link>
              <a
                href="mailto:privacy@technosthan.com"
                className={`text-sm hover:text-green-500 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Privacy Contact
              </a>
            </nav>
          </div>
        </div>

        {/* Copyright */}
        <div
          className={`border-t pt-6 text-center text-sm ${
            isDark ? "border-gray-800 text-gray-500" : "border-gray-200 text-gray-600"
          }`}
        >
          <p>© 2026 Technosthan AgriTech. All rights reserved.</p>
          <p className="mt-2">
            By using our platform, you agree to our{" "}
            <Link
              to="/terms-of-service"
              className="text-green-600 hover:underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy-policy"
              className="text-green-600 hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}

// ============================================================
// EXAMPLE: Login Page with Legal Notices
// ============================================================

import { Link } from "react-router-dom";

export function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Login to Technosthan AgriTech
        </h1>

        {/* Login Form (your existing form) */}
        {/* ... existing form code ... */}

        {/* Legal Notice - NEW */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-gray-700">
            By logging in, you agree to our{" "}
            <Link
              to="/terms-of-service"
              className="text-blue-600 hover:underline font-semibold"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy-policy"
              className="text-blue-600 hover:underline font-semibold"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        {/* Additional Help */}
        <div className="mt-4 text-center text-sm">
          <p>
            Don't have an account?{" "}
            <Link to="/signup" className="text-green-600 hover:underline">
              Sign up
            </Link>
          </p>
          <p className="mt-2">
            Need help?{" "}
            <Link to="/contact" className="text-gray-600 hover:underline">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// EXAMPLE: Registration Page Checkbox
// ============================================================

import { useState } from "react";
import { Link } from "react-router-dom";

export function RegistrationPage() {
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  return (
    <div className="registration-form">
      {/* Form fields... */}

      {/* Terms Acceptance Checkbox - NEW */}
      <div className="mt-6 flex items-start gap-3">
        <input
          type="checkbox"
          id="terms"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          required
          className="mt-1"
        />
        <label htmlFor="terms" className="text-sm text-gray-700">
          I agree to the{" "}
          <Link
            to="/terms-of-service"
            target="_blank"
            className="text-green-600 hover:underline"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            to="/privacy-policy"
            target="_blank"
            className="text-green-600 hover:underline"
          >
            Privacy Policy
          </Link>
        </label>
      </div>

      {/* Submit Button */}
      <button
        disabled={!agreedToTerms}
        className="mt-4 w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 rounded-lg transition"
      >
        Create Account
      </button>
    </div>
  );
}

// ============================================================
// EXAMPLE: Navigation Menu Entry
// ============================================================

import { Link } from "react-router-dom";

export function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-green-600">
          Technosthan AgriTech
        </Link>

        {/* Navigation Links */}
        <div className="flex gap-6 items-center">
          <Link to="/" className="text-gray-700 hover:text-green-600">
            Home
          </Link>
          <Link to="/about" className="text-gray-700 hover:text-green-600">
            About
          </Link>
          <Link to="/chat" className="text-gray-700 hover:text-green-600">
            AI Assistant
          </Link>
          <Link to="/contact" className="text-gray-700 hover:text-green-600">
            Contact
          </Link>

          {/* Legal Links - NEW (optional in navbar) */}
          <div className="relative group">
            <button className="text-gray-700 hover:text-green-600">
              Legal ▼
            </button>
            <div className="absolute hidden group-hover:block bg-white shadow-md rounded-md mt-2 right-0 z-10">
              <Link
                to="/privacy-policy"
                className="block px-4 py-2 text-gray-700 hover:bg-green-50"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms-of-service"
                className="block px-4 py-2 text-gray-700 hover:bg-green-50 border-t"
              >
                Terms of Service
              </Link>
            </div>
          </div>

          <Link
            to="/login"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ============================================================
// EXAMPLE: Using React Helmet for SEO (optional)
// ============================================================

import { Helmet } from "react-helmet";

export function PrivacyPolicyWithHelmet() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - Technosthan AgriTech</title>
        <meta
          name="description"
          content="Read our comprehensive privacy policy explaining how Technosthan AgriTech protects your personal data and privacy."
        />
        <meta property="og:title" content="Privacy Policy - Technosthan AgriTech" />
        <meta
          property="og:description"
          content="Learn how we collect, use, and protect your information."
        />
        <meta property="og:type" content="website" />
        <link
          rel="canonical"
          href="https://www.technosthan.com/privacy-policy"
        />
      </Helmet>
      {/* PrivacyPolicy component content */}
    </>
  );
}

// ============================================================
// IMPORTANT NOTES
// ============================================================

/*

1. ROUTES TO ADD:
   - /privacy-policy
   - /terms-of-service

2. FOOTER SHOULD INCLUDE:
   - Link to Privacy Policy
   - Link to Terms of Service
   - Copyright notice with links to legal docs

3. LOGIN/REGISTRATION SHOULD INCLUDE:
   - Agreement to Terms of Service
   - Agreement to Privacy Policy
   - Checkbox or notification

4. CUSTOMIZE:
   - Replace all [Your Company] placeholders
   - Update all email addresses
   - Add your physical address
   - Set correct jurisdiction

5. TEST:
   - Mobile responsive
   - Dark/light theme
   - All links work
   - Expandable sections work
   - Loading performance

6. DEPLOY:
   - Add routes to production
   - Update sitemap
   - Add to robots.txt
   - Test on production
   - Monitor analytics

*/

export default App;
