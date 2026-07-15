import PortfolioHero from "../../portfolio/components/PortfolioHero";
import PortfolioStats from "../../portfolio/components/PortfolioStats";
import FeaturedProjects from "../../portfolio/components/FeaturedProjects";
import ProjectCategories from "../../portfolio/components/ProjectCategories";
import CaseStudies from "../../portfolio/components/CaseStudies";
import PortfolioCTA from "../../portfolio/components/PortfolioCTA";

const ProductsPage = () => {
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

export default ProductsPage;
