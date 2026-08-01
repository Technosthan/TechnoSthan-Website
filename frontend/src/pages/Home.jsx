import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HeroSection from "../sections/HeroSection";
import FeaturesSection from "../sections/FeaturesSection";
import AboutSection from "../sections/AboutSection";
import ContactSection from "../sections/ContactSection";

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const allowWebsiteView =
      new URLSearchParams(location.search).get("view") === "website";

    if (token && user?.role === "admin" && !allowWebsiteView) {
      navigate("/admin/dashboard");
    }
    // Public users stay on home page
  }, [location.search, navigate]);

  return (
    <div className={`min-h-screen ${theme.bgGradient} ${theme.text}`}>
      <Navbar />
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Home;
