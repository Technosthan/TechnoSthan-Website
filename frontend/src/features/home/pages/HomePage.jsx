import Hero from "../components/Hero";
import ServicesPreview from "../components/ServicesPreview";
import TechStack from "../components/TechStack";
import WhyChooseUs from "../components/WhyChooseUs";
import ProcessSection from "../components/ProcessSection";

const HomePage = () => {
  return (
    <>
      <Hero />
      <ServicesPreview />
      <WhyChooseUs />
      <ProcessSection />
      <TechStack />
    </>
  );
};

export default HomePage;