import {
  FiArrowRight,
  FiExternalLink,
  FiMail,
  FiMapPin,
  FiMessageSquare,
  FiPhone,
} from "react-icons/fi";

import { COMPANY_ADDRESS, COMPANY_EMAIL, COMPANY_PHONE, COMPANY_PHONE_TEL } from "../../../shared/constants/company-contact";
import { FOOTER_SOCIAL_LINKS } from "../../../shared/constants/social-links";

const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(COMPANY_ADDRESS)}`;

const options = [
  {
    key: "project",
    title: "Request a project",
    copy: "Start with the form below and route the brief to the right delivery team.",
    href: "#contact-form",
    icon: FiMessageSquare,
    action: "Open form",
  },
  {
    key: "email",
    title: "Direct email",
    copy: COMPANY_EMAIL,
    href: `mailto:${COMPANY_EMAIL}`,
    icon: FiMail,
    action: "Send email",
  },
  {
    key: "phone",
    title: "Call the team",
    copy: COMPANY_PHONE,
    href: `tel:${COMPANY_PHONE_TEL}`,
    icon: FiPhone,
    action: "Call now",
  },
  {
    key: "office",
    title: "Office location",
    copy: COMPANY_ADDRESS,
    href: mapUrl,
    icon: FiMapPin,
    action: "Open maps",
    external: true,
  },
  {
    key: "social",
    title: "LinkedIn",
    copy: "Follow the public company profile for updates and announcements.",
    href: FOOTER_SOCIAL_LINKS.find((link) => link.key === "linkedin")?.href || "https://www.linkedin.com/company/technosthan/",
    icon: FiExternalLink,
    action: "View profile",
    external: true,
  },
];

const ContactOptions = () => {
  return (
    <section className="contact-options" aria-labelledby="contact-options-heading" data-motion-zone="cta">
      <div className="contact-enterprise__shell">
        <header className="contact-options__header" data-contact-reveal>
          <span className="section-badge">
            <span className="badge-dot" />
            Contact options
          </span>
          <h2 id="contact-options-heading">Reach TechnoSthan through the channel that fits your need.</h2>
          <p>
            We keep the public contact surface simple: one form, direct email, phone, the office map, and the company profile where relevant.
          </p>
        </header>

        <div className="contact-options__grid" data-contact-reveal>
          {options.map((option) => {
            const Icon = option.icon;
            const card = (
              <>
                <div className="contact-options__icon" aria-hidden="true">
                  <Icon size={18} />
                </div>
                <div className="contact-options__copy">
                  <span className="contact-options__eyebrow">{option.title}</span>
                  <p>{option.copy}</p>
                </div>
                <span className="contact-options__action">
                  {option.action}
                  <FiArrowRight size={15} />
                </span>
              </>
            );

            return option.external ? (
              <a
                key={option.key}
                className="contact-options__card"
                href={option.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {card}
              </a>
            ) : (
              <a key={option.key} className="contact-options__card" href={option.href}>
                {card}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ContactOptions;
