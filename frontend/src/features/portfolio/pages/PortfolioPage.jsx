import PortfolioHero from "../components/PortfolioHero";
import PortfolioStats from "../components/PortfolioStats";
import FeaturedProjects from "../components/FeaturedProjects";
import ProjectCategories from "../components/ProjectCategories";
import CaseStudies from "../components/CaseStudies";
import PortfolioCTA from "../components/PortfolioCTA";

const PortfolioPage = () => {
  return (
    <>
      <PortfolioHero />
      <PortfolioStats />
      <FeaturedProjects />
      <ProjectCategories />
      <CaseStudies />
      <PortfolioCTA />
    </>
  );
};

export default PortfolioPage;