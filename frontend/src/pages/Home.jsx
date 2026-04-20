import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HeroSection from "../sections/HeroSection";
import FeaturesSection from "../sections/FeaturesSection";
import AboutSection from "../sections/AboutSection";
import ContactSection from "../sections/ContactSection";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (token && user?.role === "admin") {
      navigate("/admin/dashboard");
    }
    // Public users stay on home page
  }, [navigate]);

  return (
    <div className="min-h-screen">
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
