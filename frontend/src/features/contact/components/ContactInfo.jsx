import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import {
  FiClock,
  FiExternalLink,
  FiMail,
  FiMapPin,
  FiPhone,
} from "react-icons/fi";
import "./ContactInfo.css";
import { gsap, setupGsap } from "../../../animations/gsapSetup";
import useReducedMotion from "../../../hooks/useReducedMotion";
import {
  COMPANY_ADDRESS,
  COMPANY_EMAIL,
  COMPANY_PHONE,
  COMPANY_PHONE_TEL,
} from "../../../shared/constants/company-contact";
import { FOOTER_SOCIAL_LINKS } from "../../../shared/constants/social-links";

const items = [
  { title: "Email", value: COMPANY_EMAIL, icon: FiMail, href: `mailto:${COMPANY_EMAIL}` },
  { title: "Phone", value: COMPANY_PHONE, icon: FiPhone, href: `tel:${COMPANY_PHONE_TEL}` },
  { title: "Location", value: COMPANY_ADDRESS, icon: FiMapPin },
  {
    title: "Working Hours",
    value: "Mon - Sat, 10:00 AM to 7:00 PM",
    icon: FiClock,
  },
];

const ContactInfo = () => {
  const scopeRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      setupGsap();

      if (reducedMotion || !scopeRef.current) {
        return;
      }

      const context = gsap.context(() => {
        gsap.fromTo(
          scopeRef.current.querySelectorAll("[data-contact-card]"),
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: {
              trigger: scopeRef.current,
              start: "top 80%",
              once: true,
            },
          }
        );
      }, scopeRef);

      return () => context.revert();
    },
    {
      scope: scopeRef,
      dependencies: [reducedMotion],
    }
  );

  return (
    <section className="contact-info" ref={scopeRef} data-motion-zone="cta">
      <div className="contact-enterprise__shell">
        <div className="section-header">
          <span className="section-badge">
            <span className="badge-dot" />
            Contact Details
          </span>
          <h2>
            Direct access to the people who can move your project forward
          </h2>
          <p>
            For urgent enterprise enquiries, use the contact methods below and
            we&apos;ll route your message to the right team quickly.
          </p>
        </div>

        <div className="contact-info__topline" data-contact-reveal>
          <div className="contact-info__socials">
            {FOOTER_SOCIAL_LINKS.filter((item) => item.external && item.href).map((item) => (
              <a
                key={item.key}
                href={item.href}
                className="contact-info__social"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.title}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="info-grid">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className="glass-card info-card" data-contact-card>
                <span className="info-card-icon" aria-hidden="true">
                  <Icon />
                </span>
                <h3>{item.title}</h3>
                {item.href ? (
                  <a href={item.href} className="contact-info__value">
                    {item.value}
                  </a>
                ) : (
                  <p>{item.value}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ContactInfo;
