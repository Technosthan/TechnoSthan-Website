import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation
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

import ProtectedRoute from "./component/Protected/ProtectedRoute";
import AdminRoute from "./component/Protected/AdminRoute";

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
        <ScrollToTop />
        <App />
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
    "/admin"
  ];

  const hideLayout = noGlobalLayoutPaths.includes(location.pathname);

  return (
    <>
      {!hideLayout && <Navbar />}
      {!hideLayout && <SocialSidebar />}

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

        <Route
          path="/services/technosthan-cloud"
          element={<CloudPage />}
        />

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
        <Route path="/social" element={<SocialForm />} />

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

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
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
