import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async"; // ✅ ADD THIS

import AboutPage from "./component/About/AboutPage";
import Navbar from "./component/Navbar/Navbar";
import Footer from "./component/Footer/Footer";
import Services from "./component/Services/Services";
import TechnoSthanHospitality from "./component/Services/TechnoSthanHospitality";
import TechnoSthanInnovationsHub from "./component/Services/TechnoSthanInnovationsHub";
import TechnoSthanAgritech from "./component/Services/TechnoSthanAgritech";
import TechnoSthanITServices from "./component/Services/TechnoSthanITServices";
import Contact from "./component/Contact/Contact";
import Solution from "./component/Solution/Solution";
import SocialSidebar from "./component/SocialSidebar/SocialSidebar";
import Login from "./component/Auth/Login";
import Register from "./component/Auth/Register";
import ScrollToTop from "./component/ScrollToTop";

import ProtectedRoute from "./component/Protected/ProtectedRoute";
import AdminRoute from "./component/Protected/AdminRoute";
import Home from "./component/Home/Home";

// Dummy dashboards
const Dashboard = () => <h1 style={{ color: "white" }}>User Dashboard</h1>;
const AdminDashboard = () => <h1 style={{ color: "white" }}>Admin Dashboard</h1>;


// Wrapper
function AppWrapper() {
  return (
    <Router>
      <HelmetProvider> {/* ✅ SEO WRAPPER */}
        <ScrollToTop />
        <App />
      </HelmetProvider>
    </Router>
  );
}


// MAIN APP
function App() {

  const location = useLocation();

  const hideLayout =
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <>
      {!hideLayout && <Navbar />}
      {!hideLayout && <SocialSidebar />}

      <Routes>

        {/* ✅ HOME */}
        <Route path="/" element={<Home />} />

        {/* About */}
        <Route path="/about" element={<AboutPage />} />

        {/* Services */}
        <Route path="/services" element={<Services />} />
        <Route path="/services/technosthan-hospitality" element={<TechnoSthanHospitality />} />
        <Route path="/services/technosthan-innovations-hub" element={<TechnoSthanInnovationsHub />} />
        <Route path="/services/technosthan-agritech" element={<TechnoSthanAgritech />} />
        <Route path="/services/technosthan-it-services" element={<TechnoSthanITServices />} />

        {/* Other Pages */}
        <Route path="/contact" element={<Contact />} />
        <Route path="/solution" element={<Solution />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

      </Routes>

      {!hideLayout && <Footer />}
    </>
  );
}

export default AppWrapper;