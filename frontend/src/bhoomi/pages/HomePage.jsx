import React from "react";
import {
  ArrowRight,
  Building2,
  ChevronRight,
  CircleCheckBig,
  Factory,
  Landmark,
  MapPin,
  ShieldCheck,
  Sparkles,
  Trees,
  Wrench,
  Zap,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import DynamicPageSections from "../../component/DynamicPageSections";
import SeoHead from "../components/SeoHead";
import SectionHeading from "../components/SectionHeading";
import {
  capabilityCards,
  credibilityPoints,
  homepageFeaturedProjects,
  impactStats,
  leadershipMessage,
  partnerships,
  siteBrand,
  sustainabilityMetrics,
  whatWeDo,
  infrastructureServices,
} from "../data";

const heroBackground =
  "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=2000&q=80";

const serviceIconMap = {
  "InfraReach EPC": Wrench,
  "InfraReach Smart Cities": Landmark,
  "InfraReach Industrial Parks": Factory,
  "InfraReach Renewable Energy": Zap,
  "InfraReach Asset Management": Sparkles,
};

const capabilityIconMap = {
  building: Building2,
  construction: Wrench,
  city: Landmark,
  industry: Factory,
  sun: Zap,
  chart: Sparkles,
};

const governmentHighlights = [
  {
    title: "Tender Participation",
    description: "Structured bid support with documentation readiness and scope clarity.",
    icon: Landmark,
  },
  {
    title: "EPC Execution",
    description: "Controlled engineering and turnkey delivery for institutional work.",
    icon: Wrench,
  },
  {
    title: "Public Infrastructure",
    description: "Roads, utilities, campuses and civic works with long-term usability.",
    icon: Trees,
  },
  {
    title: "Compliance Documentation",
    description: "Transparent submittals, stage gates and record keeping for tendered work.",
    icon: ShieldCheck,
  },
  {
    title: "Project Monitoring",
    description: "Progress visibility, quality checks and reporting for stakeholders.",
    icon: CircleCheckBig,
  },
  {
    title: "Institutional Partnerships",
    description: "Delivery models that support authorities, investors and strategic partners.",
    icon: Sparkles,
  },
];

const lifecycleSteps = [
  "Opportunity Assessment",
  "Feasibility and Planning",
  "Design and Engineering",
  "Procurement",
  "Construction and Execution",
  "Quality and Compliance",
  "Handover and Operations",
  "Asset Management",
];

const partnerPillars = [
  "Government bodies",
  "Developers",
  "Investors",
  "Contractors",
  "Consultants",
  "Technology partners",
  "Institutional clients",
];

const featuredProjectTypeMap = {
  "TechnoSthan Heights": "Residential",
  "InfraReach Expressway": "Infrastructure",
  "TechnoSthan Industrial Park": "Industrial",
  "Smart City Centre": "Smart City",
  "Urban Infra Project": "Infrastructure",
  "Renewable Energy Park": "Renewable",
};

const HomePage = () => {
  const location = useLocation();
  const heroServices = infrastructureServices.slice(0, 5);

  return (
    <main className="bhoomi-shell techno-home">
      <SeoHead title={siteBrand.statement} description={siteBrand.description} path="/" />

      <section className="techno-hero">
        <div
          className="techno-hero__media"
          style={{ backgroundImage: `url(${heroBackground})` }}
          aria-hidden="true"
        />
        <div className="techno-hero__overlay" aria-hidden="true" />

        <div className="site-container techno-hero__inner">
          <div className="techno-hero__content">
            <p className="techno-hero__eyebrow">TECHNOSTHAN INFRAREACH</p>
            <h1>
              Building Trust.
              <br />
              Creating Excellence.
            </h1>
            <p className="techno-hero__description">
              TechnoSthan InfraReach is committed to delivering world-class real estate
              and infrastructure solutions that build communities, empower growth,
              and shape a better tomorrow.
            </p>
            <div className="techno-hero__actions">
              <Link className="btn techno-btn techno-btn--gold" to="/projects">
                Explore Our Projects
                <ArrowRight size={16} />
              </Link>
              <Link className="btn techno-btn techno-btn--outline" to="/services">
                Our Services
                <ArrowRight size={16} />
              </Link>
            </div>
            <p className="techno-hero__supporting">{siteBrand.tagline}</p>
          </div>
        </div>
      </section>

      <DynamicPageSections route={location.pathname} position="hero" />

      <section className="site-container techno-overlap" aria-labelledby="infrastructure-development">
        <article className="techno-overlap__panel techno-overlap__panel--dark">
          <div className="techno-overlap__heading">
            <p className="techno-overlap__eyebrow">INFRASTRUCTURE DEVELOPMENT</p>
            <h2 id="infrastructure-development">Infrastructure Development</h2>
          </div>

          <div className="techno-overlap__service-grid">
            {heroServices.map((service) => {
              const Icon = serviceIconMap[service.title] || Sparkles;
              return (
                <div key={service.title} className="techno-overlap__service">
                  <span className="techno-overlap__service-icon" aria-hidden="true">
                    <Icon size={16} />
                  </span>
                  <strong>{service.title}</strong>
                  <p>{service.description}</p>
                </div>
              );
            })}
          </div>
        </article>

        <aside className="techno-overlap__panel techno-overlap__panel--light" aria-labelledby="what-we-do">
          <div className="techno-overlap__heading">
            <p className="techno-overlap__eyebrow">WHAT WE DO</p>
            <h2 id="what-we-do">What We Do</h2>
          </div>

          <ul className="techno-overlap__list">
            {whatWeDo.map((item) => (
              <li key={item.title}>
                <CircleCheckBig size={16} />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>

          <Link className="btn techno-btn techno-btn--gold" to="/what-we-do">
            Know More
            <ArrowRight size={16} />
          </Link>
        </aside>
      </section>

      <section className="site-container techno-featured">
        <div className="techno-featured__header">
          <SectionHeading
            eyebrow="OUR FEATURED PROJECTS"
            title="Projects that shape growth."
            description="Selected project stories presented in a format that is ready for investors, tender conversations and partner briefings."
          />
          <Link className="techno-featured__all" to="/projects">
            View All Projects <ArrowRight size={16} />
          </Link>
        </div>

        <div className="techno-project-grid">
          {homepageFeaturedProjects.map((project) => (
            <article key={project.title} className="techno-project-card">
              <div
                className="techno-project-card__media"
                style={{ backgroundImage: `url(${project.image})` }}
                aria-hidden="true"
              />
              <div className="techno-project-card__body">
                <div className="techno-project-card__meta">
                  <span>{featuredProjectTypeMap[project.title] || "Project"}</span>
                  <span>Featured</span>
                </div>
                <h3>{project.title}</h3>
                <p>{project.subtitle}</p>
                <span className="techno-project-card__location">
                  <MapPin size={14} />
                  {project.location}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="site-container techno-stats-strip" aria-label="Capability statistics">
        {impactStats.map((stat) => (
          <article key={stat.label} className="impact-strip__card">
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </article>
        ))}
      </section>

      <section className="site-container section-block">
        <SectionHeading
          eyebrow="INTEGRATED CAPABILITIES"
          title="An Integrated Infrastructure Ecosystem"
          description="From land planning and project finance to construction, operations and long-term asset management, our capabilities work together across the complete project lifecycle."
        />
        <div className="capability-grid">
          {capabilityCards.map((card) => (
            <Link key={card.title} to={card.link} className="capability-card">
              <div className="capability-card__media">
                <img src={card.image} alt={card.title} loading="lazy" />
              </div>
              <div className="capability-card__body">
                <div className="capability-card__icon">
                  {(() => {
                    const Icon = capabilityIconMap[card.icon] || Building2;
                    return <Icon size={18} />;
                  })()}
                </div>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <span className="text-link">
                  Learn More <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="site-container section-block">
        <SectionHeading
          eyebrow="WHAT WE DO"
          title="Development lines built for institutional conversations."
          description="Each capability opens into a dedicated detail route, making the site ready for brochures, tenders, pipeline reviews and partner briefings."
        />
        <div className="what-we-do-layout">
          {whatWeDo.map((item, index) => (
            <Link
              key={item.title}
              to={item.link}
              className={`what-we-do-item ${index % 2 === 1 ? "what-we-do-item--reverse" : ""}`}
            >
              <figure className="what-we-do-item__media">
                <img src={item.image} alt={item.title} loading="lazy" />
              </figure>
              <div className="what-we-do-item__body">
                <p className="what-we-do-item__eyebrow">{String(index + 1).padStart(2, "0")}</p>
                <h3>{item.title}</h3>
                <p>{item.capability}</p>
                <span className="text-link">
                  Learn more <ChevronRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="site-container section-block">
        <SectionHeading
          eyebrow="GOVERNMENT & INSTITUTIONAL"
          title="Government and Institutional Projects"
          description="We support public-sector and institutional development through structured tender participation, compliant execution, transparent reporting and lifecycle project delivery."
        />
        <div className="highlight-grid">
          {governmentHighlights.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="highlight-card">
                <Icon size={20} />
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            );
          })}
        </div>
        <Link className="btn btn--primary" to="/government-and-institutional-projects">
          Explore Tender Capabilities
        </Link>
      </section>

      <section className="site-container section-block section-block--split">
        <div>
          <SectionHeading
            eyebrow="PROJECT LIFECYCLE"
            title="A clean delivery sequence from opportunity to asset management."
            description="The lifecycle is designed to keep planning, procurement, construction and operations aligned, with clear handoffs at every stage."
          />
          <div className="timeline-grid">
            {lifecycleSteps.map((step, index) => (
              <article key={step} className="timeline-card">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{step}</h3>
              </article>
            ))}
          </div>
        </div>

        <div className="quote-panel">
          <p className="section-heading__eyebrow">WHY CHOOSE TECHNOSTHAN INFRAREACH</p>
          <h2>Why Choose TechnoSthan InfraReach</h2>
          <div className="credibility-grid credibility-grid--stacked">
            {credibilityPoints.map((point) => (
              <article key={point} className="credibility-card">
                <ChevronRight size={16} />
                <span>{point}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="site-container section-block sustainability-section">
        <div className="sustainability-section__media">
          <img
            src="https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1600&q=80"
            alt="Sustainable infrastructure planning"
            loading="lazy"
          />
        </div>
        <div className="sustainability-section__content">
          <SectionHeading
            eyebrow="SUSTAINABILITY"
            title="Sustainability is part of the delivery model, not an afterthought."
            description="We plan for renewable integration, energy efficiency, water management, sustainable land use, green mobility and waste management from the beginning."
          />
          <div className="metrics-grid metrics-grid--compact">
            {sustainabilityMetrics.map((item) => (
              <article key={item.label} className="sustainability-metric">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="site-container section-block">
        <SectionHeading
          eyebrow="PARTNERS AND CLIENTS"
          title="A partner model that can expand with the project lifecycle."
          description="Logo placeholders are intentionally avoided until real partner marks are available. These categories show who the platform is built to support."
        />
        <div className="partner-pills">
          {partnerPillars.map((item) => (
            <span key={item} className="partner-pill">
              {item}
            </span>
          ))}
        </div>
        <div className="partner-grid">
          {partnerships.map((item) => (
            <article key={item.title} className="partner-card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="site-container section-block">
        <SectionHeading
          eyebrow="LEADERSHIP MESSAGE"
          title="A clear point of view on what infrastructure should do."
          description="Instead of fabricated testimonials, the homepage uses a leadership statement that can later be replaced by a verified founder or partner quote."
        />
        <blockquote className="leadership-quote">
          <p>{leadershipMessage}</p>
          <footer>
            <strong>{siteBrand.name}</strong>
            <span>{siteBrand.statement}</span>
          </footer>
        </blockquote>
      </section>

      <section className="site-container section-block">
        <div className="final-cta">
          <div>
            <p className="section-heading__eyebrow">FINAL PROJECT ENQUIRY</p>
            <h2>Let's Build Infrastructure That Creates Lasting Value.</h2>
            <p>
              Connect with TechnoSthan InfraReach for real estate, infrastructure,
              EPC, industrial and institutional development opportunities.
            </p>
          </div>
          <div className="final-cta__actions">
            <Link className="btn btn--primary" to="/contact">
              Start a Conversation
            </Link>
            <Link className="btn btn--secondary" to="/contact">
              Submit a Project Enquiry
            </Link>
          </div>
        </div>
      </section>

      <DynamicPageSections route={location.pathname} position="bottom" />
    </main>
  );
};

export default HomePage;
