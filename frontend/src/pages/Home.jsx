import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import HeroSection from "../sections/HeroSection";
import StatsStrip from "../sections/StatsStrip";
import PlatformFeaturesSection from "../sections/PlatformFeaturesSection";
import HowItWorksSection from "../sections/HowItWorksSection";
import WhyChooseUsSection from "../sections/WhyChooseUsSection";
import ImpactSection from "../sections/ImpactSection";
import TestimonialsSection from "../sections/TestimonialsSection";
import LatestWikiSection from "../sections/LatestWikiSection";
import TrainingSection from "../sections/TrainingSection";
import FinalContactCtaSection from "../sections/FinalContactCtaSection";
import FeaturesSection from "../sections/FeaturesSection";
import AboutSection from "../sections/AboutSection";
import ContactSection from "../sections/ContactSection";

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
    <div className="w-full">
      <HeroSection />
      <StatsStrip />
      <AboutSection />
      <PlatformFeaturesSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ContactSection />
      <WhyChooseUsSection />
      <ImpactSection />
      <TestimonialsSection />
      <LatestWikiSection />
      <TrainingSection />
      <FinalContactCtaSection />
    </div>
  );
};

export default Home;
