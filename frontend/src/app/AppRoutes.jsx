import { Navigate, Route, Routes } from "react-router-dom";

import MainLayout from "../shared/layouts/MainLayout";
import AdminLayout from "../shared/layouts/AdminLayout";
import {
  AdminRoute,
  GuestRoute,
  ProtectedRoute,
} from "./RouteGuards";

import HomePage from "../features/home/pages/HomePage";
import AboutPage from "../features/about/pages/AboutPage";
import ServicesPage from "../features/services/pages/ServicesPage";
import ProductsPage from "../features/products/pages/ProductsPage";
import ProductDetailPage from "../features/products/pages/ProductDetailPage";
import ContactPage from "../features/contact/pages/ContactPage";
import IndustriesPage from "../features/industries/pages/IndustriesPage";
import PrivacyPolicyPage from "../features/legal/pages/PrivacyPolicyPage";
import TermsConditionsPage from "../features/legal/pages/TermsConditionsPage";
import PortfolioPage from "../features/portfolio/pages/PortfolioPage";
import ProjectDetailPage from "../features/portfolio/pages/ProjectDetailPage";
import TechnologyPage from "../features/technology/pages/TechnologyPage";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import AdminDashboard from "../features/admin/pages/Dashboard";
import ProductsAdminPage from "../features/admin/pages/ProductsPage";
import ServicesAdminPage from "../features/admin/pages/ServicesPage";
import IndustriesAdminPage from "../features/admin/pages/IndustriesPage";
import CaseStudiesAdminPage from "../features/admin/pages/CaseStudiesPage";
import TechnologyAdminPage from "../features/admin/pages/TechnologyPage";
import LeadsAdminPage from "../features/admin/pages/LeadsPage";
import MediaLibraryPage from "../features/admin/pages/MediaLibraryPage";
import SeoManagerPage from "../features/admin/pages/SeoManagerPage";
import TestimonialsPage from "../features/admin/pages/TestimonialsPage";
import HeroVisualPage from "../features/admin/pages/HeroVisualPage";
import NavbarOrbitPage from "../features/admin/pages/NavbarOrbitPage";
import DashboardPage from "../features/account/pages/DashboardPage";
import ProfilePage from "../features/account/pages/ProfilePage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }
      />

      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:productId" element={<ProductDetailPage />} />
        <Route path="/industries" element={<IndustriesPage />} />
        <Route path="/case-studies" element={<PortfolioPage />} />
        <Route path="/case-studies/:projectId" element={<ProjectDetailPage />} />
        <Route path="/technology" element={<TechnologyPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/portfolio/:projectId" element={<ProjectDetailPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-and-conditions" element={<TermsConditionsPage />} />
        <Route path="/terms" element={<Navigate to="/terms-and-conditions" replace />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<ProductsAdminPage />} />
        <Route path="services" element={<ServicesAdminPage />} />
        <Route path="industries" element={<IndustriesAdminPage />} />
        <Route path="case-studies" element={<CaseStudiesAdminPage />} />
        <Route path="technology" element={<TechnologyAdminPage />} />
        <Route path="leads" element={<LeadsAdminPage />} />
        <Route path="media-library" element={<MediaLibraryPage />} />
        <Route path="seo" element={<SeoManagerPage />} />
        <Route path="testimonials" element={<TestimonialsPage />} />
        <Route path="hero-visual" element={<HeroVisualPage />} />
        <Route path="navbar-orbit" element={<NavbarOrbitPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
