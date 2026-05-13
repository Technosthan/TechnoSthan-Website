import React from "react";
import { Helmet } from "react-helmet-async";
import "./LegalPages.css";

const TermsConditions = () => {
  return (
    <main className="legal-page">
      <Helmet>
        <title>Terms & Conditions | TechnoSthan</title>
        <meta
          name="description"
          content="Read the TechnoSthan terms and conditions for Agriculture, Hospitality, Innovation Hub, Technology Solutions, Digital Services, and Research & Development offerings."
        />
      </Helmet>

      <div className="legal-page__inner">
        <section className="legal-hero">
          <p className="legal-hero__eyebrow">Terms & Conditions</p>
          <h1 className="legal-hero__title">
            Terms that govern your use of TechnoSthan
          </h1>
          <p className="legal-hero__intro">
            These Terms & Conditions apply to all users of technosthan.com and
            describe the relationship between our platform, our services, and
            the people who engage with them.
          </p>
        </section>

        <div className="legal-sections">
          <article className="legal-section">
            <h2 className="legal-section__title">Acceptance of Terms</h2>
            <p className="legal-section__text">
              By accessing or using TechnoSthan, you agree to these Terms &
              Conditions and any updates we publish. If you do not agree, please
              do not use our platform or services.
            </p>
          </article>

          <article className="legal-section">
            <h2 className="legal-section__title">About TechnoSthan</h2>
            <p className="legal-section__text">
              TechnoSthan is a multi-sector platform serving Agriculture &
              Agritech, Hospitality Services, Innovation Hub, Digital Solutions
              & ID Services, and Research & Technology Services. We connect
              users with digital solutions, advisory services, and innovation
              support across these sectors.
            </p>
          </article>

          <article className="legal-section">
            <h2 className="legal-section__title">Services Offered</h2>
            <ul className="legal-section__list">
              <li>Agriculture</li>
              <li>Hospitality</li>
              <li>Innovation Hub</li>
              <li>Technology Solutions</li>
              <li>Digital Services</li>
              <li>Research & Development</li>
            </ul>
          </article>

          <article className="legal-section">
            <h2 className="legal-section__title">User Responsibilities</h2>
            <p className="legal-section__text">
              You are responsible for keeping your login details secure,
              providing accurate information, and using our platform in
              compliance with applicable laws. You may not impersonate others or
              misuse our services.
            </p>
          </article>

          <article className="legal-section">
            <h2 className="legal-section__title">Prohibited Activities</h2>
            <ul className="legal-section__list">
              <li>Unauthorized use of the platform or any of its systems.</li>
              <li>Uploading malicious or infringing content.</li>
              <li>
                Interfering with site operations or attempting to bypass
                security.
              </li>
              <li>Violating any local, national, or international law.</li>
            </ul>
          </article>

          <article className="legal-section">
            <h2 className="legal-section__title">Intellectual Property</h2>
            <p className="legal-section__text">
              All content, design, logos, text, and images on technosthan.com
              are the property of TechnoSthan or its licensors. You may not
              copy, reproduce, or redistribute content without prior written
              permission.
            </p>
          </article>

          <article className="legal-section">
            <h2 className="legal-section__title">Payments & Transactions</h2>
            <p className="legal-section__text">
              Any payments collected through our platform are subject to the
              terms disclosed during the purchase or booking process. You are
              responsible for verifying charges and complying with payment
              provider terms.
            </p>
          </article>

          <article className="legal-section">
            <h2 className="legal-section__title">Service Availability</h2>
            <p className="legal-section__text">
              We strive to maintain high availability, but service interruptions
              may occur for maintenance or due to technical issues. TechnoSthan
              does not guarantee uninterrupted access at all times.
            </p>
          </article>

          <article className="legal-section">
            <h2 className="legal-section__title">Limitation of Liability</h2>
            <p className="legal-section__text">
              TechnoSthan is not liable for indirect, incidental, or
              consequential losses arising from the use of our platform. Our
              liability is limited to the maximum extent permitted by applicable
              law.
            </p>
          </article>

          <article className="legal-section">
            <h2 className="legal-section__title">Termination</h2>
            <p className="legal-section__text">
              We may suspend or terminate access to your account if you violate
              these terms, misuse the platform, or compromise the integrity of
              our services.
            </p>
          </article>

          <article className="legal-section">
            <h2 className="legal-section__title">Governing Law</h2>
            <p className="legal-section__text">
              These Terms & Conditions are governed by the applicable laws of
              India. Any disputes will be handled in the appropriate courts in
              India unless otherwise required by local regulation.
            </p>
          </article>

          <article className="legal-section">
            <h2 className="legal-section__title">Changes to Terms</h2>
            <p className="legal-section__text">
              We may modify these terms at any time. Updated terms will be
              posted on technosthan.com. Continued use of the platform after
              changes means you accept the updated terms.
            </p>
          </article>

          <article className="legal-section">
            <h2 className="legal-section__title">Contact Information</h2>
            <div className="legal-contact">
              <p className="legal-section__text">
                If you have questions about these terms, reach out to us at:
              </p>
              <a
                href="https://technosthan.com"
                target="_blank"
                rel="noreferrer"
              >
                technosthan.com
              </a>
              <a href="mailto:sci_kol@rediffmail.com">sci_kol@rediffmail.com</a>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
};

export default TermsConditions;
