import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";

import ContactHero from "../components/ContactHero";
import ContactEnterpriseBackground from "../components/ContactEnterpriseBackground";
import ContactFAQ from "../components/ContactFAQ";
import ContactOptions from "../components/ContactOptions";
import ContactInfo from "../components/ContactInfo";
import ContactForm from "../components/ContactForm";
import OfficeLocation from "../components/OfficeLocation";
import ContactCTA from "../components/ContactCTA";
import { gsap, setupGsap } from "../../../animations/gsapSetup";
import useReducedMotion from "../../../hooks/useReducedMotion";
import "../styles/contact-enterprise.css";

const createMeta = (selector, attrs) => {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attrs).forEach(([name, value]) => {
    element.setAttribute(name, value);
  });

  return element;
};

const createLink = (rel, href) => {
  let element = document.head.querySelector(`link[rel="${rel}"]`);

  if (!element) {
    element = document.createElement("link");
    document.head.appendChild(element);
  }

  element.setAttribute("rel", rel);
  element.setAttribute("href", href);

  return element;
};

const setJsonLd = (id, data) => {
  let script = document.getElementById(id);

  if (!script) {
    script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify(data);
  return script;
};

const ContactPage = () => {
  const pageRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    const canonical = `${window.location.origin}/contact`;
    const previousTitle = document.title;
    const previousDescription =
      document.head.querySelector('meta[name="description"]')?.getAttribute("content") || "";
    const previousCanonical =
      document.head.querySelector('link[rel="canonical"]')?.getAttribute("href") || "";

    const title = "Contact TechnoSthan | Enterprise Inquiries";
    const description =
      "Contact TechnoSthan for project requests, business inquiries, consultations, support, and partnership discussions.";

    document.title = title;
    createMeta('meta[name="description"]', {
      name: "description",
      content: description,
    });
    createMeta('meta[property="og:title"]', {
      property: "og:title",
      content: title,
    });
    createMeta('meta[property="og:description"]', {
      property: "og:description",
      content: description,
    });
    createMeta('meta[property="og:url"]', {
      property: "og:url",
      content: canonical,
    });
    createMeta('meta[property="og:type"]', {
      property: "og:type",
      content: "website",
    });
    createMeta('meta[name="twitter:card"]', {
      name: "twitter:card",
      content: "summary_large_image",
    });
    createMeta('meta[name="twitter:title"]', {
      name: "twitter:title",
      content: title,
    });
    createMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: description,
    });
    createLink("canonical", canonical);

    const contactScript = setJsonLd("contact-page-jsonld", {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: title,
      description,
      url: canonical,
      mainEntity: {
        "@type": "Organization",
        name: "Technosthan",
      },
    });

    return () => {
      document.title = previousTitle;
      const descriptionMeta = document.head.querySelector('meta[name="description"]');
      if (descriptionMeta && previousDescription) {
        descriptionMeta.setAttribute("content", previousDescription);
      }

      const canonicalLink = document.head.querySelector('link[rel="canonical"]');
      if (canonicalLink && previousCanonical) {
        canonicalLink.setAttribute("href", previousCanonical);
      }

      contactScript?.remove();
    };
  }, []);

  useGSAP(
    () => {
      setupGsap();

      if (reducedMotion || !pageRef.current) {
        return undefined;
      }

      const context = gsap.context(() => {
        const targets = pageRef.current.querySelectorAll("[data-contact-reveal]");

        gsap.fromTo(
          targets,
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: pageRef.current,
              start: "top 82%",
              once: true,
            },
          }
        );
      }, pageRef);

      return () => context.revert();
    },
    { scope: pageRef, dependencies: [reducedMotion] }
  );

  return (
    <main className="contact-enterprise" ref={pageRef}>
      <ContactEnterpriseBackground />
      <ContactHero />
      <ContactOptions />
      <ContactForm />
      <ContactInfo />
      <OfficeLocation />
      <ContactFAQ />
      <ContactCTA />
    </main>
  );
};

export default ContactPage;
