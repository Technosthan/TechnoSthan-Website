import React from "react";
import { useLocation } from "react-router-dom";
import DynamicPageSections from "../../component/DynamicPageSections";
import { siteBrand } from "../data";
import SeoHead from "../components/SeoHead";
import PageHero from "../components/PageHero";
import EnquiryForm from "../components/EnquiryForm";

const ContactPage = () => {
  const location = useLocation();

  return (
    <main className="bhoomi-shell">
      <SeoHead
        title="Contact"
        description="Contact TechnoSthan InfraReach for property enquiries, partnerships, investments, institutional projects and vendor registration."
        path={location.pathname}
      />
      <PageHero
        eyebrow="CONTACT"
        title="Let’s discuss your project."
        description="Use the form to reach the right team for property, partnership, landowner, investor or government-related enquiries."
        image="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1600&q=80"
        video={false}
        primaryCta={{ label: "Explore Projects", to: "/projects" }}
        secondaryCta={{ label: "Partnerships", to: "/partnerships" }}
      />
      <DynamicPageSections route={location.pathname} position="hero" />
      <section className="site-container section-block section-block--split">
        <EnquiryForm title={`Contact ${siteBrand.name}`} />
        <div className="location-stack">
          <article className="location-card">
            <h3>Office</h3>
            <p>{siteBrand.contact.address}</p>
          </article>
          <article className="location-card">
            <h3>Email</h3>
            <p>{siteBrand.contact.email}</p>
          </article>
          <article className="location-card">
            <h3>Phone</h3>
            <p>{siteBrand.contact.phone}</p>
          </article>
        </div>
      </section>
      <DynamicPageSections route={location.pathname} position="bottom" />
    </main>
  );
};

export default ContactPage;
