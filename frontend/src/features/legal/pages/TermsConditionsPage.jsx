import { Link } from "react-router-dom";

import EnterpriseLegalPageShell from "../components/EnterpriseLegalPageShell";

const today = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
}).format(new Date());

const TermsConditionsPage = () => {
  return (
    <EnterpriseLegalPageShell
      eyebrow="Terms and conditions"
      title="Terms & Conditions"
      subtitle="The terms that apply when you access the TechnoSthan website or engage the team through public channels."
      lastUpdated={today}
      metaTitle="Terms & Conditions | TechnoSthan"
      metaDescription="Review the terms that govern use of TechnoSthan's public website, services, intellectual property, and inquiry channels."
      canonicalPath="/terms-and-conditions"
    >
      <section className="legal-enterprise__section" data-legal-reveal>
        <h2>Acceptance</h2>
        <div className="legal-enterprise__body">
          <p>
            By accessing this website, you agree to these Terms & Conditions. If you do not
            accept them, please do not continue to use the website or submit forms.
          </p>
        </div>
      </section>

      <section className="legal-enterprise__section" data-legal-reveal>
        <h2>Website Usage</h2>
        <div className="legal-enterprise__body">
          <p>
            You may use the website for lawful business, research, and communication purposes.
            You must not attempt to disrupt the site, bypass security controls, or misuse forms,
            uploads, or public endpoints.
          </p>
        </div>
      </section>

      <section className="legal-enterprise__section" data-legal-reveal>
        <h2>Services</h2>
        <div className="legal-enterprise__body">
          <p>
            The website describes TechnoSthan's services and case studies for informational
            purposes. Specific engagement terms, scope, and deliverables are defined separately
            through project discussions or written proposals.
          </p>
        </div>
      </section>

      <section className="legal-enterprise__section" data-legal-reveal>
        <h2>User Responsibilities</h2>
        <div className="legal-enterprise__body">
          <ul>
            <li>Provide accurate information when submitting forms or enquiries</li>
            <li>Use the website respectfully and lawfully</li>
            <li>Avoid uploading files that you do not have the right to share</li>
            <li>Do not attempt unauthorized access to systems or content</li>
          </ul>
        </div>
      </section>

      <section className="legal-enterprise__section" data-legal-reveal>
        <h2>Intellectual Property</h2>
        <div className="legal-enterprise__body">
          <p>
            All site content, branding, layouts, graphics, and code assets remain the property of
            TechnoSthan or its licensors unless otherwise stated. You may not copy, reproduce, or
            distribute them without permission.
          </p>
        </div>
      </section>

      <section className="legal-enterprise__section" data-legal-reveal>
        <h2>Payments</h2>
        <div className="legal-enterprise__body">
          <p>
            If a project includes paid services, payment terms will be documented in the project
            agreement, invoice, or proposal. Website browsing itself does not create a payment
            obligation.
          </p>
        </div>
      </section>

      <section className="legal-enterprise__section" data-legal-reveal>
        <h2>Refund Policy</h2>
        <div className="legal-enterprise__body">
          <p>
            Refunds, if any, are handled according to the specific project agreement. Because
            enterprise work is typically scoped and approved in stages, any refund arrangement is
            determined case by case and documented in writing.
          </p>
        </div>
      </section>

      <section className="legal-enterprise__section" data-legal-reveal>
        <h2>Disclaimer</h2>
        <div className="legal-enterprise__body">
          <p>
            The website is provided on an "as is" basis for general information and communication.
            While we work to keep the site accurate and available, TechnoSthan does not warrant
            that every page will be uninterrupted, error-free, or suitable for every purpose.
          </p>
        </div>
      </section>

      <section className="legal-enterprise__section" data-legal-reveal>
        <h2>Limitation of Liability</h2>
        <div className="legal-enterprise__body">
          <p>
            To the extent permitted by law, TechnoSthan will not be liable for indirect,
            incidental, special, or consequential losses arising from website use, technical
            interruptions, or reliance on public content.
          </p>
        </div>
      </section>

      <section className="legal-enterprise__section" data-legal-reveal>
        <h2>Termination</h2>
        <div className="legal-enterprise__body">
          <p>
            TechnoSthan may suspend or restrict access to the website where necessary for
            security, maintenance, compliance, or operational reasons.
          </p>
        </div>
      </section>

      <section className="legal-enterprise__section" data-legal-reveal>
        <h2>External Links</h2>
        <div className="legal-enterprise__body">
          <p>
            The website may include links to external sites. TechnoSthan is not responsible for
            the content, policies, or availability of third-party websites.
          </p>
        </div>
      </section>

      <section className="legal-enterprise__section" data-legal-reveal>
        <h2>Privacy Reference</h2>
        <div className="legal-enterprise__body">
          <p>
            The handling of personal information is described in the Privacy Policy. Please read
            both pages together if you are submitting an enquiry or request.
          </p>
          <Link to="/privacy" className="btn-secondary legal-enterprise__inline-link">
            Read privacy policy
          </Link>
        </div>
      </section>

      <section className="legal-enterprise__section" data-legal-reveal>
        <h2>Governing Law</h2>
        <div className="legal-enterprise__body">
          <p>
            These terms are intended to be interpreted in accordance with the laws applicable in
            the jurisdiction where TechnoSthan operates, unless a project agreement states
            otherwise.
          </p>
        </div>
      </section>

      <section className="legal-enterprise__section legal-enterprise__section--contact" data-legal-reveal>
        <h2>Contact</h2>
        <div className="legal-enterprise__body">
          <p>
            If you have questions about these terms or about a proposed engagement, please use
            the public contact page.
          </p>
          <Link to="/contact" className="btn-primary legal-enterprise__inline-link">
            Contact TechnoSthan
          </Link>
        </div>
      </section>
    </EnterpriseLegalPageShell>
  );
};

export default TermsConditionsPage;

