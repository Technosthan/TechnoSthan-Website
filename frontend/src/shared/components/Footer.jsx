import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiArrowUp,
  FiMail,
  FiMapPin,
  FiPhone,
  FiZap,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { useGSAP } from "@gsap/react";

import { subscribe } from "../../api/subscribers.api";
import {
  COMPANY_ADDRESS,
  COMPANY_EMAIL,
  COMPANY_PHONE,
  COMPANY_PHONE_TEL,
} from "../constants/company-contact";
import {
  CASE_STUDIES_ROUTE,
  INDUSTRIES_ROUTE,
  PRODUCTS_ROUTE,
  TECHNOLOGY_ROUTE,
} from "../constants";
import { FOOTER_SOCIAL_LINKS } from "../constants/social-links";
import { gsap, setupGsap } from "../../animations/gsapSetup";
import useReducedMotion from "../../hooks/useReducedMotion";
import "./footer.css";

const footerLinks = {
  company: [
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
    { label: "Case Studies", to: CASE_STUDIES_ROUTE },
  ],
  services: [
    { label: "Services", to: "/services" },
    { label: "Technology", to: TECHNOLOGY_ROUTE },
    { label: "Industries", to: INDUSTRIES_ROUTE },
  ],
  products: [
    { label: "Products", to: PRODUCTS_ROUTE },
    { label: "Portfolio", to: "/portfolio" },
  ],
  resources: [
    { label: "Privacy Policy", to: "/privacy" },
    { label: "Terms and Conditions", to: "/terms-and-conditions" },
  ],
};

const contactDetails = [
  { icon: FiPhone, label: "Phone", value: COMPANY_PHONE, href: `tel:${COMPANY_PHONE_TEL}` },
  { icon: FiMail, label: "Email", value: COMPANY_EMAIL, href: `mailto:${COMPANY_EMAIL}` },
  { icon: FiMapPin, label: "Location", value: COMPANY_ADDRESS },
];

const brandStatement = "Engineering digital systems built to scale.";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const footerRef = useRef(null);
  const visualRef = useRef(null);
  const lineRef = useRef(null);
  const pulseRef = useRef(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      setupGsap();

      if (!footerRef.current) {
        return undefined;
      }

      const context = gsap.context(() => {
        const revealTargets = footerRef.current.querySelectorAll("[data-footer-reveal]");

        gsap.fromTo(
          revealTargets,
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: footerRef.current,
              start: "top 82%",
              once: true,
            },
          }
        );

        if (!reducedMotion && lineRef.current) {
          const length = lineRef.current.getTotalLength();
          gsap.set(lineRef.current, {
            strokeDasharray: length,
            strokeDashoffset: length,
          });

          gsap.to(lineRef.current, {
            strokeDashoffset: 0,
            duration: 1.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: footerRef.current,
              start: "top 82%",
              once: true,
            },
          });
        }

        if (!reducedMotion && pulseRef.current) {
          gsap.fromTo(
            pulseRef.current,
            { attr: { cx: 102 }, opacity: 0.72 },
            {
              attr: { cx: 318 },
              opacity: 1,
              duration: 2.8,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
            }
          );
        }
      }, footerRef);

      return () => context.revert();
    },
    { scope: footerRef, dependencies: [reducedMotion] }
  );

  useEffect(() => {
    const element = footerRef.current;
    if (
      !element ||
      typeof window === "undefined" ||
      reducedMotion ||
      !window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches
    ) {
      return undefined;
    }

    let frame = 0;

    const updatePointer = (event) => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const rect = element.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / Math.max(1, rect.width)) * 100;
        const y = ((event.clientY - rect.top) / Math.max(1, rect.height)) * 100;
        element.style.setProperty("--footer-pointer-x", `${Math.max(0, Math.min(100, x))}%`);
        element.style.setProperty("--footer-pointer-y", `${Math.max(0, Math.min(100, y))}%`);
      });
    };

    const resetPointer = () => {
      element.style.setProperty("--footer-pointer-x", "72%");
      element.style.setProperty("--footer-pointer-y", "16%");
    };

    resetPointer();
    element.addEventListener("pointermove", updatePointer, { passive: true });
    element.addEventListener("pointerleave", resetPointer, { passive: true });

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      element.removeEventListener("pointermove", updatePointer);
      element.removeEventListener("pointerleave", resetPointer);
    };
  }, [reducedMotion]);

  const handleSubscribe = async (event) => {
    event.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await subscribe({ email });
      toast.success("You are subscribed to Technosthan updates.");
      setEmail("");
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;

      if (status === 409 || (msg && msg.toLowerCase().includes("already"))) {
        toast.error("This email is already subscribed.");
      } else {
        toast.error("Failed to subscribe. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToTop = () => {
    if (typeof window === "undefined") {
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  const socialLinks = useMemo(
    () =>
      FOOTER_SOCIAL_LINKS.filter((item) => item?.href && item?.label).map(
        (item) => item
      ),
    []
  );

  return (
    <footer className="footer site-footer footer-editorial" ref={footerRef}>
      <div className="footer-background" ref={visualRef} aria-hidden="true">
        <svg
          className="footer-background__network"
          viewBox="0 0 1200 520"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="footer-network-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(14, 165, 233, 0.12)" />
              <stop offset="58%" stopColor="rgba(14, 165, 233, 0.72)" />
              <stop offset="100%" stopColor="rgba(239, 91, 42, 0.92)" />
            </linearGradient>
            <filter id="footer-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            ref={lineRef}
            d="M 0 350 C 140 300, 220 160, 400 196 S 700 360, 860 188 S 1080 84, 1200 132"
            fill="none"
            stroke="url(#footer-network-gradient)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <circle cx="0" cy="350" r="4" fill="rgba(14, 165, 233, 0.65)" />
          <circle cx="400" cy="196" r="4" fill="rgba(14, 165, 233, 0.8)" />
          <circle cx="860" cy="188" r="5" fill="rgba(239, 91, 42, 0.92)" filter="url(#footer-glow)" />
          <circle ref={pulseRef} cx="102" cy="326" r="7" fill="rgba(239, 91, 42, 0.96)" filter="url(#footer-glow)" />
          <circle cx="1200" cy="132" r="4" fill="rgba(14, 165, 233, 0.72)" />
        </svg>
      </div>

      <div className="footer-shell footer-editorial-shell">
        <div className="footer-brand-panel" data-footer-reveal>
          <Link to="/" className="footer-brand-link" aria-label="Technosthan home">
            <span className="footer-brand-mark" aria-hidden="true">
              <FiZap size={18} />
            </span>
            <span className="footer-brand-copy">
              <strong>Technosthan</strong>
              <span>Enterprise IT Services</span>
            </span>
          </Link>

          <p className="footer-brand-copy__text">
            Technosthan builds software, cloud platforms, and digital experiences for teams that need clarity, speed, and trust.
          </p>

          <div className="footer-brand-statement">{brandStatement}</div>

          <form className="footer-updates" onSubmit={handleSubscribe}>
            <label className="footer-updates__label" htmlFor="footer-updates-email">
              Stay in sync
            </label>
            <div className="footer-updates__row">
              <input
                id="footer-updates-email"
                type="email"
                placeholder="Enter your email"
                className="footer-updates__input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <button
                className="footer-updates__button"
                type="submit"
                disabled={loading}
                aria-label="Subscribe to updates"
              >
                <FiArrowRight size={18} />
              </button>
            </div>
          </form>

          <div className="footer-socials" data-footer-reveal>
            {socialLinks.map(({ icon: Icon, href, label, external }) => (
              <a
                key={label}
                className="footer-social-link"
                href={href}
                title={label}
                aria-label={label}
                target={external || href.startsWith("http") ? "_blank" : undefined}
                rel={external || href.startsWith("http") ? "noopener noreferrer" : undefined}
              >
                <Icon size={18} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        <div className="footer-navigation-grid" data-footer-reveal>
          <nav className="footer-nav-column" aria-label="Company">
            <span className="footer-nav-title">Company</span>
            {footerLinks.company.map((item) =>
              item.to ? (
                <Link key={item.label} to={item.to} className="footer-nav-link">
                  {item.label}
                </Link>
              ) : (
                <a key={item.label} href={item.href} className="footer-nav-link">
                  {item.label}
                </a>
              )
            )}
          </nav>

          <nav className="footer-nav-column" aria-label="Services">
            <span className="footer-nav-title">Services</span>
            {footerLinks.services.map((item) => (
              <Link key={item.label} to={item.to} className="footer-nav-link">
                {item.label}
              </Link>
            ))}
          </nav>

          <nav className="footer-nav-column" aria-label="Products">
            <span className="footer-nav-title">Products</span>
            {footerLinks.products.map((item) => (
              <Link key={item.label} to={item.to} className="footer-nav-link">
                {item.label}
              </Link>
            ))}
          </nav>

          <nav className="footer-nav-column" aria-label="Resources">
            <span className="footer-nav-title">Resources</span>
            {footerLinks.resources.map((item) => (
              <Link key={item.label} to={item.to} className="footer-nav-link">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="footer-contact-panel" data-footer-reveal>
          <div className="footer-contact-panel__heading">
            <span className="footer-nav-title">Contact</span>
            <p>Direct contact for project, service, and enterprise discussions.</p>
          </div>

          <div className="footer-contact-list">
            {contactDetails.map((item) => {
              const Icon = item.icon;

              return (
                <div className="footer-contact-row" key={item.label}>
                  <span className="footer-contact-icon" aria-hidden="true">
                    <Icon size={16} />
                  </span>
                  <div className="footer-contact-copy">
                    <span className="footer-contact-label">{item.label}</span>
                    {item.href ? (
                      <a href={item.href}>{item.value}</a>
                    ) : (
                      <span>{item.value}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="footer-bottom-bar" data-footer-reveal>
          <div className="footer-bottom-copy">
            <span className="footer-bottom-mark" aria-hidden="true">
              <FiZap size={14} />
            </span>
            <p>
              &copy; {currentYear} Technosthan IT Services. All rights reserved.
            </p>
          </div>

          <div className="footer-bottom-links" aria-label="Legal and utilities">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms-and-conditions">Terms and Conditions</Link>
            <button
              type="button"
              className="footer-back-to-top"
              onClick={handleBackToTop}
              aria-label="Back to top"
            >
              <FiArrowUp aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
