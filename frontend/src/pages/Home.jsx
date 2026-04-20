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
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors duration-500">
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
