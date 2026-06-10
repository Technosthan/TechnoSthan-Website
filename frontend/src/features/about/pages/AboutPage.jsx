import "../styles/about.css";

import AboutHero from "../components/AboutHero";
import CompanyStory from "../components/CompanyStory";
import MissionVision from "../components/MissionVision";
import WhyChooseUs from "../components/WhyChooseUs";
import CompanyStats from "../components/CompanyStats";
import Team from "../components/Team";
import AboutCTA from "../components/AboutCTA";

const AboutPage = () => {
  return (
    <>
      <AboutHero />
      <CompanyStory />
      <MissionVision />
      <WhyChooseUs />
      <CompanyStats />
      <Team />
      <AboutCTA />
    </>
  );
};

export default AboutPage;