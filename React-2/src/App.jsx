import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

/* COMPONENTS */
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

/* DASHBOARDS */
import Dashboard from "./component/Dashboard/Dashboard";
import AdminDashboard from "./component/AdminDashboard/AdminDashboard";

/* PROTECTED */
import ProtectedRoute from "./component/Protected/ProtectedRoute";
import AdminRoute from "./component/Protected/AdminRoute";

/* PAGES */
 import Home from "./component/Home/Home";
import SocialForm from "./component/SocialForm/SocialForm";
import ExplorePage from "./Tab/ExplorePage";


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

  const hideLayout =
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <>
      {!hideLayout && <Navbar />}
      {!hideLayout && <SocialSidebar />}

      <Routes>

        {/* HOME */}
        <Route path="/" element={<Home />} />

        {/* ABOUT */}
        <Route path="/about" element={<AboutPage />} />

        {/* SERVICES */}
        <Route path="/services" element={<Services />} />
        <Route path="/services/technosthan-hospitality" element={<TechnoSthanHospitality />} />
        <Route path="/services/technosthan-innovations-hub" element={<TechnoSthanInnovationsHub />} />
        <Route path="/services/technosthan-agritech" element={<TechnoSthanAgritech />} />
        <Route path="/services/technosthan-it-services" element={<TechnoSthanITServices />} />

        {/* OTHER */}
        <Route path="/contact" element={<Contact />} />
        <Route path="/solution" element={<Solution />} />

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* SOCIAL FORM */}
        <Route path="/social" element={<SocialForm />} />

        {/* USER DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* explore page  */}
                <Route path="/explore" element={<ExplorePage />} />


        {/* ADMIN DASHBOARD FIXED */}
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