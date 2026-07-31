import useHomeEditorial from "../hooks/useHomeEditorial";
import HomepageBackground from "../components/HomepageBackground";
import DigitalEarthHero from "../components/DigitalEarthHero";
import EditorialManifesto from "../components/EditorialManifesto";
import EditorialServices from "../components/EditorialServices";
import EditorialProjects from "../components/EditorialProjects";
import EditorialStats from "../components/EditorialStats";
import EditorialWhy from "../components/EditorialWhy";
import EditorialTestimonials from "../components/EditorialTestimonials";
import EditorialClosing from "../components/EditorialClosing";
import "../styles/editorial-home.css";

const HomePage = () => {
  const {
    heroVisual,
    services,
    projects,
    testimonials,
    stats,
    featuredService,
  } = useHomeEditorial();

  return (
    <div className="editorial-home">
      <HomepageBackground />

      <div className="homepage-content">
        <DigitalEarthHero
          heroVisual={heroVisual}
          featuredService={featuredService}
        />
        <EditorialManifesto projects={projects} />
        <EditorialServices services={services} />
        <EditorialProjects projects={projects} />
        <EditorialStats stats={stats} />
        <EditorialWhy services={services} projects={projects} />
        <EditorialTestimonials testimonials={testimonials} />
        <EditorialClosing />
      </div>
    </div>
  );
};

export default HomePage;
