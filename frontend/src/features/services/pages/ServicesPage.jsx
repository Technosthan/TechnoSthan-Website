import ServicesHero from "../components/ServicesHero";
import ServiceGrid from "../components/ServiceGrid";
import ProcessSection from "../components/ProcessSection";
import Technologies from "../components/Technologies";
import Industries from "../components/Industries";
import PricingModels from "../components/PricingModels";
import FAQ from "../components/FAQ";

import ServicesCTA from "../components/ServicesCTA";

const ServicesPage = () => {
  return (
    <>
      <ServicesHero />
      <ServiceGrid />
      <ProcessSection />
      <Technologies />
      <Industries />
      <PricingModels />
      <FAQ />
      <ServicesCTA />
    </>
  );
};

export default ServicesPage;