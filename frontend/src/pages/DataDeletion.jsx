import React from "react";
import { Helmet } from "react-helmet-async";
import "./LegalPages.css";

const DataDeletion = () => {
  return (
    <main className="legal-page">
      <Helmet>
        <title>Data Deletion Instructions | TechnoSthan</title>
        <meta
          name="description"
          content="Learn how to request deletion of your personal data at TechnoSthan with clear steps, required details, and expected processing time."
        />
      </Helmet>

      <div className="legal-page__inner">
        <section className="legal-hero">
          <p className="legal-hero__eyebrow">Data Deletion</p>
          <h1 className="legal-hero__title">How to request removal of your personal data</h1>
          <p className="legal-hero__intro">
            We respect your rights to privacy and provide this page as a clear guide to request deletion of your data from TechnoSthan systems.
          </p>
        </section>

        <div className="legal-sections">
          <article className="legal-section">
            <h2 className="legal-section__title">Requesting Data Deletion</h2>
            <p className="legal-section__text">
              To request deletion of your personal information, send an email to the address below with the subject line exactly as shown. We will review your request and respond promptly.
            </p>
          </article>

          <article className="legal-section">
            <h2 className="legal-section__title">Email Address</h2>
            <p className="legal-section__text">
              <a href="mailto:sci_kol@rediffmail.com">sci_kol@rediffmail.com</a>
            </p>
          </article>

          <article className="legal-section">
            <h2 className="legal-section__title">Subject Line</h2>
            <p className="legal-section__text">Use the following subject line for your email:</p>
            <div className="legal-section__note">Data Deletion Request</div>
          </article>

          <article className="legal-section">
            <h2 className="legal-section__title">Required Details</h2>
            <p className="legal-section__text">Please include the following information in your request:</p>
            <ul className="legal-section__list">
              <li>Full Name</li>
              <li>Registered Email</li>
              <li>Request Details</li>
            </ul>
          </article>

          <article className="legal-section">
            <h2 className="legal-section__title">Processing Time</h2>
            <p className="legal-section__text">
              We will review and respond to data deletion requests within 7 business days. If we need additional information, we will contact you at the address you provide.
            </p>
          </article>

          <article className="legal-section">
            <h2 className="legal-section__title">What Happens Next</h2>
            <p className="legal-section__text">
              After verifying your request, TechnoSthan will delete or anonymize the data that we are legally permitted to remove. Some information may remain if required for compliance, fraud prevention, or contractual obligations.
            </p>
          </article>

          <article className="legal-section">
            <h2 className="legal-section__title">Contact Information</h2>
            <div className="legal-contact">
              <p className="legal-section__text">If you have questions about your request, contact:</p>
              <a href="https://technosthan.com" target="_blank" rel="noreferrer">technosthan.com</a>
              <a href="mailto:sci_kol@rediffmail.com">sci_kol@rediffmail.com</a>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
};

export default DataDeletion;
