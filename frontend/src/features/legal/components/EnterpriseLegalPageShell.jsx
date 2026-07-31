import { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiMail,
  FiMapPin,
  FiPhone,
  FiShield,
} from "react-icons/fi";
import { useGSAP } from "@gsap/react";

import {
  COMPANY_ADDRESS,
  COMPANY_EMAIL,
  COMPANY_NAME,
  COMPANY_PHONE,
  COMPANY_PHONE_TEL,
} from "../../../shared/constants/company-contact";
import { gsap, setupGsap } from "../../../animations/gsapSetup";
import useReducedMotion from "../../../hooks/useReducedMotion";
import "../styles/legal-enterprise.css";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

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

const EnterpriseLegalPageShell = ({
  eyebrow,
  title,
  subtitle,
  lastUpdated,
  metaTitle,
  metaDescription,
  canonicalPath,
  children,
}) => {
  const rootRef = useRef(null);
  const pathRefs = useRef([]);
  const nodeRefs = useRef([]);
  const reducedMotion = useReducedMotion();

  const canonical = useMemo(() => {
    if (typeof window === "undefined") {
      return canonicalPath;
    }

    return `${window.location.origin}${canonicalPath}`;
  }, [canonicalPath]);

  const seoIdBase = useMemo(
    () =>
      canonicalPath
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, "") || "legal-page",
    [canonicalPath]
  );

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    const previousTitle = document.title;
    const previousDescription =
      document.head.querySelector('meta[name="description"]')?.getAttribute("content") || "";
    const previousCanonical = document.head.querySelector('link[rel="canonical"]')?.getAttribute("href") || "";

    document.title = metaTitle;
    createMeta('meta[name="description"]', {
      name: "description",
      content: metaDescription,
    });
    createMeta('meta[property="og:title"]', {
      property: "og:title",
      content: metaTitle,
    });
    createMeta('meta[property="og:description"]', {
      property: "og:description",
      content: metaDescription,
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
      content: metaTitle,
    });
    createMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: metaDescription,
    });
    createLink("canonical", canonical);

    const breadcrumbScript = setJsonLd(`${seoIdBase}-breadcrumb-jsonld`, {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${window.location.origin}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: title,
          item: canonical,
        },
      ],
    });

    const webPageScript = setJsonLd(`${seoIdBase}-webpage-jsonld`, {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: metaTitle,
      description: metaDescription,
      url: canonical,
      isPartOf: {
        "@type": "WebSite",
        name: COMPANY_NAME,
        url: `${window.location.origin}/`,
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

      breadcrumbScript?.remove();
      webPageScript?.remove();
    };
  }, [canonical, metaDescription, metaTitle, seoIdBase, title]);

  useGSAP(
    () => {
      setupGsap();

      if (!rootRef.current) {
        return undefined;
      }

      const context = gsap.context(() => {
        const targets = rootRef.current.querySelectorAll("[data-legal-reveal]");
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
              trigger: rootRef.current,
              start: "top 85%",
              once: true,
            },
          }
        );

        if (!reducedMotion) {
          pathRefs.current
            .filter(Boolean)
            .forEach((path, index) => {
              const length = path.getTotalLength();
              gsap.set(path, {
                strokeDasharray: length,
                strokeDashoffset: length,
              });

              gsap.to(path, {
                strokeDashoffset: 0,
                duration: 1.4 + index * 0.15,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: rootRef.current,
                  start: "top 85%",
                  once: true,
                },
              });
            });

          gsap.to(nodeRefs.current.filter(Boolean), {
            y: "-=10",
            duration: 4.2,
            repeat: -1,
            yoyo: true,
            stagger: 0.18,
            ease: "sine.inOut",
          });
        }
      }, rootRef);

      return () => context.revert();
    },
    { scope: rootRef, dependencies: [reducedMotion] }
  );

  useEffect(() => {
    const root = rootRef.current;
    if (
      !root ||
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
        const rect = root.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / Math.max(1, rect.width)) * 100;
        const y = ((event.clientY - rect.top) / Math.max(1, rect.height)) * 100;
        root.style.setProperty("--legal-pointer-x", `${clamp(x, 0, 100)}%`);
        root.style.setProperty("--legal-pointer-y", `${clamp(y, 0, 100)}%`);
      });
    };

    const resetPointer = () => {
      root.style.setProperty("--legal-pointer-x", "68%");
      root.style.setProperty("--legal-pointer-y", "18%");
    };

    resetPointer();
    root.addEventListener("pointermove", updatePointer, { passive: true });
    root.addEventListener("pointerleave", resetPointer, { passive: true });

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      root.removeEventListener("pointermove", updatePointer);
      root.removeEventListener("pointerleave", resetPointer);
    };
  }, [reducedMotion]);

  const contactItems = useMemo(
    () => [
      {
        icon: FiPhone,
        label: "Phone",
        value: COMPANY_PHONE,
        href: `tel:${COMPANY_PHONE_TEL}`,
      },
      {
        icon: FiMail,
        label: "Email",
        value: COMPANY_EMAIL,
        href: `mailto:${COMPANY_EMAIL}`,
      },
      {
        icon: FiMapPin,
        label: "Location",
        value: COMPANY_ADDRESS,
      },
    ],
    []
  );

  return (
    <main className={`legal-enterprise ${reducedMotion ? "is-reduced" : ""}`.trim()} ref={rootRef}>
      <div className="legal-enterprise__background" aria-hidden="true">
        <svg
          className="legal-enterprise__network"
          viewBox="0 0 1200 800"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id="legal-network-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="rgba(45, 212, 200, 0.12)" />
              <stop offset="55%" stopColor="rgba(74, 141, 255, 0.56)" />
              <stop offset="100%" stopColor="rgba(239, 91, 42, 0.34)" />
            </linearGradient>
            <radialGradient id="legal-node-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.94)" />
              <stop offset="100%" stopColor="rgba(45, 212, 200, 0.08)" />
            </radialGradient>
          </defs>

          <path
            ref={(node) => {
              pathRefs.current[0] = node;
            }}
            className="legal-enterprise__line"
            d="M 0 180 C 140 120, 230 250, 372 188 S 622 86, 748 162 S 1040 282, 1200 148"
          />
          <path
            ref={(node) => {
              pathRefs.current[1] = node;
            }}
            className="legal-enterprise__line legal-enterprise__line--soft"
            d="M 56 610 C 170 536, 262 644, 396 580 S 656 478, 804 558 S 1042 682, 1200 594"
          />
          <path
            ref={(node) => {
              pathRefs.current[2] = node;
            }}
            className="legal-enterprise__line legal-enterprise__line--vertical"
            d="M 248 0 C 232 128, 250 230, 292 346 S 372 566, 300 800"
          />

          <circle ref={(node) => { nodeRefs.current[0] = node; }} className="legal-enterprise__node legal-enterprise__node--primary" cx="372" cy="188" r="12" fill="url(#legal-node-glow)" />
          <circle ref={(node) => { nodeRefs.current[1] = node; }} className="legal-enterprise__node" cx="748" cy="162" r="10" fill="rgba(74, 141, 255, 0.92)" />
          <circle ref={(node) => { nodeRefs.current[2] = node; }} className="legal-enterprise__node" cx="396" cy="580" r="10" fill="rgba(45, 212, 200, 0.9)" />
          <circle ref={(node) => { nodeRefs.current[3] = node; }} className="legal-enterprise__node" cx="804" cy="558" r="11" fill="rgba(239, 91, 42, 0.95)" />
          <circle ref={(node) => { nodeRefs.current[4] = node; }} className="legal-enterprise__node" cx="300" cy="328" r="8" fill="rgba(255, 255, 255, 0.8)" />
        </svg>

        <div className="legal-enterprise__grid" />
        <div className="legal-enterprise__glow" />
        <div className="legal-enterprise__spotlight" />
        <div className="legal-enterprise__noise" />
      </div>

      <div className="legal-enterprise__shell">
        <header className="legal-enterprise__hero" data-legal-reveal>
          <span className="section-badge legal-enterprise__eyebrow">
            <span className="badge-dot" />
            {eyebrow}
          </span>
          <h1>{title}</h1>
          <p>{subtitle}</p>

          <div className="legal-enterprise__hero-meta">
            <span className="legal-enterprise__updated">Last updated</span>
            <strong>{lastUpdated}</strong>
            <span className="legal-enterprise__security">
              <FiShield size={14} aria-hidden="true" />
              Enterprise legal notice
            </span>
          </div>
        </header>

        <div className="legal-enterprise__layout">
          <div className="legal-enterprise__content">{children}</div>

          <aside className="legal-enterprise__aside" data-legal-reveal>
            <div className="legal-enterprise__aside-card">
              <span className="legal-enterprise__aside-label">Need assistance?</span>
              <h2>Talk to the team</h2>
              <p>
                If you want clarification on these terms or on how your information is handled,
                reach out using the verified company contact details below.
              </p>

              <div className="legal-enterprise__contact-list">
                {contactItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div className="legal-enterprise__contact-row" key={item.label}>
                      <span className="legal-enterprise__contact-icon" aria-hidden="true">
                        <Icon size={15} />
                      </span>
                      <div className="legal-enterprise__contact-copy">
                        <span>{item.label}</span>
                        {item.href ? <a href={item.href}>{item.value}</a> : <strong>{item.value}</strong>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <Link to="/contact" className="btn-primary legal-enterprise__cta">
                Contact TechnoSthan
                <FiArrowRight size={16} />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default EnterpriseLegalPageShell;
