import React from "react";
import { useLocation, useParams, Navigate } from "react-router-dom";
import DynamicPageSections from "../../component/DynamicPageSections";
import { getServiceBySlug } from "../data";
import SeoHead from "../components/SeoHead";
import PageHero from "../components/PageHero";
import SectionHeading from "../components/SectionHeading";
import EnquiryForm from "../components/EnquiryForm";

const ServiceDetailPage = () => {
  const { slug } = useParams();
  const location = useLocation();
  const service = getServiceBySlug(slug);

  if (!service) {
    return <Navigate to="/services" replace />;
  }

  return (
    <main className="bhoomi-shell">
      <SeoHead
        title={service.title}
        description={service.description}
        path={location.pathname}
        image={service.image}
      />
      <PageHero
        eyebrow="INFRAREACH SERVICE"
        title={service.title}
        description={service.positioning}
        image={service.image}
        video={false}
        primaryCta={{ label: "Discuss this service", to: "/contact" }}
        secondaryCta={{ label: "View projects", to: "/projects" }}
      />
      <DynamicPageSections route={location.pathname} position="hero" />

      <section className="site-container section-block section-block--split">
        <div>
          <SectionHeading
            eyebrow="SERVICE OVERVIEW"
            title="A structured capability page for investors and delivery teams."
            description={service.description}
          />
          <div className="copy-grid">
            <article className="copy-card">
              <h3>Capabilities</h3>
              <ul className="inline-list">
                {service.capabilities.map((capability) => (
                  <li key={capability}>{capability}</li>
                ))}
              </ul>
            </article>
            <article className="copy-card">
              <h3>Project types</h3>
              <ul className="inline-list">
                {service.projectTypes.map((type) => (
                  <li key={type}>{type}</li>
                ))}
              </ul>
            </article>
            <article className="copy-card">
              <h3>Value delivered</h3>
              <p>{service.value}</p>
            </article>
          </div>
        </div>
        <EnquiryForm title={service.cta} compact />
      </section>

      <DynamicPageSections route={location.pathname} position="bottom" />
    </main>
  );
};

export default ServiceDetailPage;

