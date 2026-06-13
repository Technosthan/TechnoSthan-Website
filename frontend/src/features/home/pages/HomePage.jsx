import Hero from "../components/Hero";
import ServicesPreview from "../components/ServicesPreview";
import TechStack from "../components/TechStack";
import WhyChooseUs from "../components/WhyChooseUs";
import ProcessSection from "../components/ProcessSection";
import Testimonials from "../components/Testimonials";

const HomePage = () => {
  return (
    <>
      <Hero />
      <ServicesPreview />
      <WhyChooseUs />
      <Testimonials />
      <ProcessSection />
      <TechStack />
      
    </>
  );
};

export default HomePage;