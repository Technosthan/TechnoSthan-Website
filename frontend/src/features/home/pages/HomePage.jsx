import Hero from "../components/Hero";
import ServicesPreview from "../components/ServicesPreview";
import TechStack from "../components/TechStack";
import WhyChooseUs from "../components/WhyChooseUs";
import ProcessSection from "../components/ProcessSection";
import Testimonials from "../components/Testimonials";
import Industries from "../../services/components/Industries";
import FAQ from "../../services/components/FAQ";
import ServicesCTA from "../../services/components/ServicesCTA";
import PortfolioStats from "../../portfolio/components/PortfolioStats";
import FeaturedProjects from "../../portfolio/components/FeaturedProjects";
import CaseStudies from "../../portfolio/components/CaseStudies";

const HomePage = () => {
  return (
    <>
      <Hero />
      <ServicesPreview />
      <Industries />
      <WhyChooseUs />
      <FeaturedProjects />
      <CaseStudies />
      <Testimonials />
      <ProcessSection />
      <TechStack />
      <PortfolioStats />
      <FAQ />
      <ServicesCTA />
    </>
  );
};

export default HomePage;
