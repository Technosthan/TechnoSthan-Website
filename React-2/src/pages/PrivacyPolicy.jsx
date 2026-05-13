import React from "react";
import { Helmet } from "react-helmet-async";
import "./LegalPages.css";

const PrivacyPolicy = () => {
  return (
    <main className="legal-page">
      <Helmet>
        <title>Privacy Policy | TechnoSthan</title>
        <meta
          name="description"
          content="Learn how TechnoSthan collects, uses and protects your data across agriculture, hospitality, innovation hub and digital solutions services."
        />
      </Helmet>

      <div className="legal-page__inner">
        <section className="legal-hero">
          <p className="legal-hero__eyebrow">Privacy Policy</p>
          <h1 className="legal-hero__title">How TechnoSthan protects your personal information</h1>
          <p className="legal-hero__intro">
            TechnoSthan is committed to maintaining trust across our multi-sector platform. This Privacy Policy explains how we collect, use, share and protect information for visitors of technosthan.com.
          </p>
        </section>

        <div className="legal-sections">
          <article className="legal-section">
            <h2 className="legal-section__title">Introduction</h2>
            <p className="legal-section__text">
              TechnoSthan operates as a platform for Agriculture & Agritech, Hospitality Services, Innovation Hub, Digital Solutions & ID Services, and Research & Technology Services. We value your privacy and handle data in a way that supports trust, transparency, and security.
            </p>
          </article>

          <article className="legal-section">
            <h2 className="legal-section__title">Information We Collect</h2>
            <p className="legal-section__text">
              We collect information you provide directly, such as contact details, inquiries, account details, and support requests. We may also gather usage data, device information, browser details, and analytics data automatically when you visit technosthan.com.
            </p>
          </article>

          <article className="legal-section">
            <h2 className="legal-section__title">How We Use Information</h2>
            <ul className="legal-section__list">
              <li>To provide, improve and personalize our services.</li>
              <li>To communicate about your requests, updates, and service announcements.</li>
              <li>To analyze site usage and optimize our platform.</li>
              <li>To protect the security and integrity of our systems.</li>
            </ul>
          </article>

          <article className="legal-section">
            <h2 className="legal-section__title">Cookies & Tracking</h2>
            <p className="legal-section__text">
              We use cookies, local storage, and similar tracking technologies to enhance performance, remember preferences, and understand how visitors use our site. This enables faster, more relevant experiences when interacting with our content and services.
            </p>
          </article>

          <article className="legal-section">
            <h2 className="legal-section__title">Third-Party Services</h2>
            <p className="legal-section__text">
              TechnoSthan may use Meta/Facebook services, analytics tools, payment gateways, and cloud services. Third-party providers may collect and process data on our behalf to support website performance, marketing, payments, and customer service.
            </p>
          </article>

          <article className="legal-section">
            <h2 className="legal-section__title">Data Protection</h2>
            <p className="legal-section__text">
              We maintain administrative, technical, and physical safeguards designed to protect your information. Access is restricted to authorized personnel, and we regularly review security practices to reduce risk.
            </p>
          </article>

          <article className="legal-section">
            <h2 className="legal-section__title">User Rights</h2>
            <ul className="legal-section__list">
              <li>Right to access the data we hold about you.</li>
              <li>Right to correct or update inaccurate information.</li>
              <li>Right to request deletion or restriction of processing.</li>
              <li>Right to withdraw consent where applicable.</li>
            </ul>
          </article>

          <article className="legal-section">
            <h2 className="legal-section__title">Children’s Privacy</h2>
            <p className="legal-section__text">
              Our services are not intended for children under 18. We do not knowingly collect personal data from minors without parental consent. If we learn that we have collected information from a child, we will take steps to delete it promptly.
            </p>
          </article>

          <article className="legal-section">
            <h2 className="legal-section__title">Data Retention</h2>
            <p className="legal-section__text">
              We retain data only as long as necessary for the purposes described in this policy, or as required by law. When information is no longer needed, we securely delete or anonymize it.
            </p>
          </article>

          <article className="legal-section">
            <h2 className="legal-section__title">International Transfers</h2>
            <p className="legal-section__text">
              Data may be stored or processed in locations outside your home country. When transfers occur, we rely on appropriate safeguards and compliant service providers to protect your data.
            </p>
          </article>

          <article className="legal-section">
            <h2 className="legal-section__title">Updates to Policy</h2>
            <p className="legal-section__text">
              We may update this Privacy Policy from time to time. When material changes occur, we will post the updated policy on technosthan.com and update the effective date.
            </p>
          </article>

          <article className="legal-section">
            <h2 className="legal-section__title">Contact Information</h2>
            <div className="legal-contact">
              <p className="legal-section__text">If you have questions about this policy or your data, contact us at:</p>
              <a href="https://technosthan.com" target="_blank" rel="noreferrer">technosthan.com</a>
              <a href="mailto:sci_kol@rediffmail.com">sci_kol@rediffmail.com</a>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
